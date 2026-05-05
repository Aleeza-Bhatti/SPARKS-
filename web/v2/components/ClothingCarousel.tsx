"use client";

const CAROUSEL_IMAGES = [
  { url: "https://amariah.co/cdn/shop/files/A_00772.jpg?v=1720549057&width=600", alt: "Taupe maxi dress" },
  { url: "https://amariah.co/cdn/shop/products/custom_resized_f0101bf8-2f23-4bb3-99da-f621e1544e06.jpg?v=1680021515&width=600", alt: "Rose maxi dress" },
  { url: "https://www.zahraathelabel.com/cdn/shop/files/2024_0602_ZTLSummerLuxe1193-3_f778ad62-b49a-457e-99d7-17a988a5c66d.jpg?v=1719504840&width=600", alt: "Teal satin set" },
  { url: "https://www.zahraathelabel.com/cdn/shop/files/8_2a40bea9-52be-4e77-b337-f27f3f66dd21.png?v=1765425862&width=600", alt: "Oatmeal knit set" },
  { url: "https://www.niswafashion.com/cdn/shop/files/152061708586643_.pic_hd_1.jpg?v=1708863593&width=600", alt: "Kimono abaya set" },
  { url: "https://byhasanat.co.uk/cdn/shop/files/IMG_3213.jpg?v=1720788856&width=600", alt: "Sage linen dress" },
  { url: "https://linaziada.com/cdn/shop/files/18_97d62acf-8028-4773-9d72-c897bb4d0ff6.png?v=1741491164&width=600", alt: "Ivory abaya coat" },
  { url: "https://linaziada.com/cdn/shop/files/5a3b605b-40b4-497b-bb2f-8e052318df16.jpg?v=1763387239&width=600", alt: "Cacao knit dress" },
  { url: "https://amariah.co/cdn/shop/files/6-6-10412330.jpg?v=1718041686&width=600", alt: "Cream tie waist top" },
];

export default function ClothingCarousel() {
  const doubled = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];

  return (
    <div className="w-full overflow-hidden">
      <div className="carousel-track flex gap-3">
        {doubled.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-36 h-48 rounded-2xl overflow-hidden bg-[rgba(102,12,13,0.05)]"
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
