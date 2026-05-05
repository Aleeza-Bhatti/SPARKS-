"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import Image from "next/image";

export type SwipeDirection = "like" | "nope" | "love";

type Props = {
  imageUrl: string;
  tags: string[];
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = second, 2 = third
  onSwipe: (dir: SwipeDirection) => void;
};

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 400;

export default function SwipeCard({ imageUrl, tags, isTop, stackIndex, onSwipe }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const loveOpacity = useTransform(y, [-SWIPE_THRESHOLD, -20], [1, 0]);

  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const fly = async (dir: SwipeDirection) => {
    const targets: Record<SwipeDirection, { x: number; y: number }> = {
      like:  { x: 600,  y: 50  },
      nope:  { x: -600, y: 50  },
      love:  { x: 0,    y: -600 },
    };
    await controls.start({ ...targets[dir], transition: { duration: 0.35, ease: "easeOut" } });
    onSwipe(dir);
  };

  const handleDragEnd = (_: never, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      fly("like");
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      fly("nope");
    } else if (offset.y < -SWIPE_THRESHOLD || velocity.y < -VELOCITY_THRESHOLD) {
      fly("love");
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
    }
  };

  const stackStyles = [
    { scale: 1,    y: 0,  zIndex: 30 },
    { scale: 0.97, y: 10, zIndex: 20 },
    { scale: 0.94, y: 20, zIndex: 10 },
  ][stackIndex] ?? { scale: 0.9, y: 30, zIndex: 0 };

  return (
    <motion.div
      ref={cardRef}
      data-swipe-card
      animate={controls}
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        scale: stackStyles.scale,
        zIndex: stackStyles.zIndex,
        position: "absolute",
        width: "100%",
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-[#FAF8F5]">
        <Image
          src={imageUrl}
          alt="Style card"
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 480px) 90vw, 380px"
          unoptimized
        />

        {/* Bottom tags */}
        {isTop && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-4">
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-white/90 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stamps — only visible on top card while dragging */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 border-4 border-brand text-brand font-extrabold text-2xl tracking-widest px-3 py-1 rounded-lg rotate-[-12deg]"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-6 right-6 border-4 border-terracotta text-terracotta font-extrabold text-2xl tracking-widest px-3 py-1 rounded-lg rotate-[12deg]"
            >
              NOPE
            </motion.div>
            <motion.div
              style={{ opacity: loveOpacity }}
              className="absolute top-6 left-1/2 -translate-x-1/2 border-4 border-brand-amber text-brand-amber font-extrabold text-2xl tracking-widest px-3 py-1 rounded-lg"
            >
              LOVE
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
