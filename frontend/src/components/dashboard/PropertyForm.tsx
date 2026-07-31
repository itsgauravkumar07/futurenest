"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import type { ListingType, Property } from "@/types";

const propertyTypes = [
  "Apartment",
  "Villa",
  "Plot",
  "House",
  "Commercial Property",
  "Flat",
  "PG",
  "Office",
  "Shop",
  "Commercial Space",
];

interface Props {
  mode: "create" | "edit";
  propertyId?: string;
  initialData?: Property;
}

export default function PropertyForm({ mode, propertyId, initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [listingType, setListingType] = useState<ListingType>(initialData?.listingType || "sale");
  const [propertyType, setPropertyType] = useState(initialData?.propertyType || "Apartment");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [address, setAddress] = useState(initialData?.location?.address || "");
  const [city, setCity] = useState(initialData?.location?.city || "");
  const [state, setState] = useState(initialData?.location?.state || "");
  const [pincode, setPincode] = useState(initialData?.location?.pincode || "");
  const [bedrooms, setBedrooms] = useState(initialData?.specs?.bedrooms?.toString() || "");
  const [bathrooms, setBathrooms] = useState(initialData?.specs?.bathrooms?.toString() || "");
  const [areaSqft, setAreaSqft] = useState(initialData?.specs?.areaSqft?.toString() || "");
  const [images, setImages] = useState<string[]>(initialData?.images?.map((img) => img.url) || []);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleUploadingChange = (isUploading: boolean) => {
    setUploadingCount((prev) => Math.max(0, prev + (isUploading ? 1 : -1)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title,
      description,
      listingType,
      propertyType,
      price: Number(price),
      location: { address, city, state, pincode },
      specs: {
        ...(bedrooms && { bedrooms: Number(bedrooms) }),
        ...(bathrooms && { bathrooms: Number(bathrooms) }),
        ...(areaSqft && { areaSqft: Number(areaSqft) }),
      },
      images: images.map((url) => ({ url })),
    };

    try {
      if (mode === "create") {
        await api.post("/properties", payload);
      } else {
        await api.put(`/properties/${propertyId}`, payload);
      }
      router.push("/dashboard/seller/properties");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
      {mode === "edit" && (
        <p className="rounded-md bg-amber-light px-4 py-3 text-sm text-amber">
          Editing this property will send it back for admin re-review.
        </p>
      )}

      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input id="title" required className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={4}
          className="input resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="listingType">
            Listing type
          </label>
          <select
            id="listingType"
            className="input"
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType)}
          >
            <option value="sale">For Sale</option>
            <option value="rental">For Rent</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="propertyType">
            Property type
          </label>
          <select id="propertyType" className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="price">
          Price (₹{listingType === "rental" ? " per month" : ""})
        </label>
        <input
          id="price"
          type="number"
          required
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <p className="label mb-2">Location</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Address" required className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input placeholder="City" required className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          <input placeholder="State" required className="input" value={state} onChange={(e) => setState(e.target.value)} />
          <input placeholder="Pincode" className="input" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
      </div>

      <div>
        <p className="label mb-2">Specs (optional)</p>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Bedrooms"
            className="input"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
          <input
            type="number"
            placeholder="Bathrooms"
            className="input"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
          <input
            type="number"
            placeholder="Area (sqft)"
            className="input"
            value={areaSqft}
            onChange={(e) => setAreaSqft(e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="label mb-2">
          Photos <span className="font-normal text-slate-light">(max 5 photos, 2MB each)</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <ImageUpload
              key={i}
              label=""
              value={url}
              onChange={(newUrl) => {
                if (!newUrl) {
                  setImages((prev) => prev.filter((_, idx) => idx !== i));
                } else {
                  setImages((prev) => prev.map((u, idx) => (idx === i ? newUrl : u)));
                }
              }}
              onUploadingChange={handleUploadingChange}
            />
          ))}
          {images.length < 5 && (
            <ImageUpload
              label=""
              value=""
              onChange={(url) => url && setImages((prev) => [...prev, url])}
              onUploadingChange={handleUploadingChange}
            />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-brick">{error}</p>}

      <button type="submit" disabled={submitting || uploadingCount > 0} className="btn-primary">
        {uploadingCount > 0
          ? "Uploading photo…"
          : submitting
          ? "Saving…"
          : mode === "create"
          ? "Submit for review"
          : "Save changes"}
      </button>
    </form>
  );
}
