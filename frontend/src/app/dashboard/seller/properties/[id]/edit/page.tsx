"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import PropertyForm from "@/components/dashboard/PropertyForm";
import Spinner from "@/components/Spinner";
import type { Property } from "@/types";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // There's no GET /properties/mine/:id endpoint yet — the seller's full
    // list (any status) is fetched and filtered client-side to find this one.
    api
      .get("/properties/mine/all")
      .then((res) => {
        const found = (res.data.properties as Property[]).find((p) => p._id === params.id);
        if (found) setProperty(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) return <p className="text-sm text-brick">Property not found, or it doesn&apos;t belong to you.</p>;
  if (!property) return <Spinner label="Loading property…" />;

  return (
    <div>
      <h1 className="text-2xl">Edit Property</h1>
      <PropertyForm mode="edit" propertyId={property._id} initialData={property} />
    </div>
  );
}
