import { notFound } from "next/navigation";
import { BedDouble, Bath, Ruler, MapPin, ShieldCheck } from "lucide-react";
import { getProperty } from "@/lib/server-api";
import { formatPrice, formatDate } from "@/lib/utils";
import InterestButton from "@/components/InterestButton";
import PropertyGallery from "@/components/PropertyGallery";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { property } = await getProperty(params.id);

  if (!property) notFound();

  return (
    <div className="container-page py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="relative">
            <PropertyGallery images={property.images || []} title={property.title} />
            <span className="pill absolute left-4 top-4 z-10 bg-white/95 text-ink">
              {property.listingType === "rental" ? "For Rent" : "For Sale"}
            </span>
          </div>

          {/* Title + location */}
          <div className="mt-6">
            <h1 className="text-3xl">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate">
              <MapPin size={15} />
              {property.location.address}, {property.location.city}, {property.location.state}
              {property.location.pincode ? ` – ${property.location.pincode}` : ""}
            </p>
          </div>

          {/* Specs */}
          {property.specs && (
            <div className="mt-6 flex gap-6 border-y border-line py-4 text-sm text-ink">
              {property.specs.bedrooms !== undefined && (
                <span className="flex items-center gap-2">
                  <BedDouble size={18} className="text-accent-dark" /> {property.specs.bedrooms} Bedrooms
                </span>
              )}
              {property.specs.bathrooms !== undefined && (
                <span className="flex items-center gap-2">
                  <Bath size={18} className="text-accent-dark" /> {property.specs.bathrooms} Bathrooms
                </span>
              )}
              {property.specs.areaSqft !== undefined && (
                <span className="flex items-center gap-2">
                  <Ruler size={18} className="text-accent-dark" /> {property.specs.areaSqft} sqft
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-medium">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate">
              {property.description}
            </p>
          </div>

          {/* Property type + listed date */}
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate">
            <span>
              Type: <span className="text-ink">{property.propertyType}</span>
            </span>
            <span>
              Listed: <span className="text-ink">{formatDate(property.createdAt)}</span>
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card sticky top-24 p-6">
            <p className="font-mono text-3xl text-ink">{formatPrice(property.price, property.priceUnit)}</p>

            <div className="mt-5">
              <InterestButton propertyId={property._id} />
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-md bg-paper-dim p-3 text-xs text-slate">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-leaf" />
              <p>
                For your safety and the seller&apos;s, contact details aren&apos;t shown publicly. Once you
                express interest, our team will personally reach out to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
