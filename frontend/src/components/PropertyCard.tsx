import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import type { Property } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0]?.url;

  return (
    <Link href={`/properties/${property._id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-50">
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-light">
            No image yet
          </div>
        )}
        <span
          className={`pill absolute left-3 top-3 ${
            property.listingType === "rental" ? "bg-white/90 text-ink" : "bg-white/90 text-ink"
          }`}
        >
          {property.listingType === "rental" ? "For Rent" : "For Sale"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-lg text-ink">{formatPrice(property.price, property.priceUnit)}</p>
        <h3 className="mt-1 line-clamp-1 text-base font-medium text-ink">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate">
          <MapPin size={13} />
          {property.location.city}, {property.location.state}
        </p>

        {property.specs && (
          <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-xs text-slate">
            {property.specs.bedrooms !== undefined && (
              <span className="flex items-center gap-1">
                <BedDouble size={14} /> {property.specs.bedrooms}
              </span>
            )}
            {property.specs.bathrooms !== undefined && (
              <span className="flex items-center gap-1">
                <Bath size={14} /> {property.specs.bathrooms}
              </span>
            )}
            {property.specs.areaSqft !== undefined && (
              <span className="flex items-center gap-1">
                <Ruler size={14} /> {property.specs.areaSqft} sqft
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
