import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { getProperties } from "@/lib/server-api";

const saleTypes = ["Apartment", "Villa", "Plot", "House", "Commercial Property"];
const rentalTypes = ["Flat", "House", "PG", "Office", "Shop", "Commercial Space"];

interface Props {
  searchParams: {
    search?: string;
    listingType?: string;
    propertyType?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  const { properties, pagination } = await getProperties({
    ...searchParams,
    limit: "12",
  });

  const propertyTypeOptions =
    searchParams.listingType === "rental" ? rentalTypes : searchParams.listingType === "sale" ? saleTypes : [...saleTypes, ...rentalTypes];

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, value);
    });
    params.set("page", String(page));
    return `/properties?${params.toString()}`;
  };

  return (
    // <div className="container-page py-10 md:py-14">
    //   <p className="eyebrow mb-2">
    //     {searchParams.listingType === "rental" ? "For Rent" : searchParams.listingType === "sale" ? "For Sale" : "All Properties"}
    //   </p>
    //   <h1 className="text-3xl">Browse verified properties</h1>

    //   {/* Filter bar — plain GET form, no client JS needed */}
    //   <form action="/properties" className="card mt-8 grid gap-4 p-5 md:grid-cols-6">
    //     <div className="md:col-span-2">
    //       <label className="label" htmlFor="search">
    //         Search
    //       </label>
    //       <input
    //         id="search"
    //         name="search"
    //         defaultValue={searchParams.search}
    //         placeholder="Title or description"
    //         className="input"
    //       />
    //     </div>
    //     <div>
    //       <label className="label" htmlFor="listingType">
    //         Type
    //       </label>
    //       <select id="listingType" name="listingType" defaultValue={searchParams.listingType || ""} className="input">
    //         <option value="">Any</option>
    //         <option value="sale">For Sale</option>
    //         <option value="rental">For Rent</option>
    //       </select>
    //     </div>
    //     <div>
    //       <label className="label" htmlFor="propertyType">
    //         Property type
    //       </label>
    //       <select id="propertyType" name="propertyType" defaultValue={searchParams.propertyType || ""} className="input">
    //         <option value="">Any</option>
    //         {propertyTypeOptions.map((t) => (
    //           <option key={t} value={t}>
    //             {t}
    //           </option>
    //         ))}
    //       </select>
    //     </div>
    //     <div>
    //       <label className="label" htmlFor="city">
    //         City
    //       </label>
    //       <input id="city" name="city" defaultValue={searchParams.city} placeholder="Dehradun" className="input" />
    //     </div>
    //     <div className="grid grid-cols-2 gap-2 md:col-span-1">
    //       <div>
    //         <label className="label" htmlFor="minPrice">
    //           Min ₹
    //         </label>
    //         <input id="minPrice" name="minPrice" type="number" defaultValue={searchParams.minPrice} className="input" />
    //       </div>
    //       <div>
    //         <label className="label" htmlFor="maxPrice">
    //           Max ₹
    //         </label>
    //         <input id="maxPrice" name="maxPrice" type="number" defaultValue={searchParams.maxPrice} className="input" />
    //       </div>
    //     </div>
    //     <div className="flex items-end md:col-span-6">
    //       <button type="submit" className="btn-primary">
    //         Apply filters
    //       </button>
    //       {Object.values(searchParams).some(Boolean) && (
    //         <Link href="/properties" className="btn-ghost ml-2">
    //           Clear
    //         </Link>
    //       )}
    //     </div>
    //   </form>

    //   {/* Results */}
    //   <div className="mt-10">
    //     <p className="mb-5 text-sm text-slate">{pagination.total} properties found</p>

    //     {properties.length === 0 ? (
    //       <div className="card p-12 text-center">
    //         <p className="text-lg font-medium">No properties match those filters</p>
    //         <p className="mt-1 text-sm text-slate">Try widening your search, or check back soon — new listings are added regularly.</p>
    //       </div>
    //     ) : (
    //       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    //         {properties.map((property) => (
    //           <PropertyCard key={property._id} property={property} />
    //         ))}
    //       </div>
    //     )}

    //     {pagination.pages > 1 && (
    //       <div className="mt-10 flex items-center justify-center gap-2">
    //         {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
    //           <Link
    //             key={p}
    //             href={buildPageHref(p)}
    //             className={`flex h-9 w-9 items-center justify-center rounded text-sm ${
    //               p === pagination.page ? "bg-ink text-paper" : "border border-line text-ink hover:border-ink"
    //             }`}
    //           >
    //             {p}
    //           </Link>
    //         ))}
    //       </div>
    //     )}
    //   </div>
    // </div>

    <div className="container-page py-16 md:py-20">

  {/* Header */}

  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

    <div>

      <p className="eyebrow mb-3">
        {searchParams.listingType === "rental"
          ? "For Rent"
          : searchParams.listingType === "sale"
          ? "For Sale"
          : "All Properties"}
      </p>

      <h1 className="text-4xl">
        Browse Verified Properties
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate">
        Discover verified residential and commercial properties
        from trusted owners and agents.
      </p>

    </div>

    {/* Total */}

    <div className="rounded-2xl border border-line bg-white px-6 py-4 shadow-sm">

      <p className="text-xs uppercase tracking-wider text-slate">
        Available
      </p>

      <p className="mt-1 text-3xl font-semibold text-ink">
        {pagination.total}
      </p>

      <p className="text-sm text-slate">
        Properties
      </p>

    </div>

  </div>

  {/* Filter */}

  <form
    action="/properties"
    className="mt-10 rounded-3xl border border-line bg-white p-6 shadow-sm"
  >

    <div className="grid gap-5 md:grid-cols-6">

      <div className="md:col-span-2">

        <label className="label">
          Search
        </label>

        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Title or description"
          className="input mt-2"
        />

      </div>

      <div>

        <label className="label">
          Type
        </label>

        <select
          name="listingType"
          defaultValue={searchParams.listingType || ""}
          className="input mt-2"
        >
          <option value="">Any</option>
          <option value="sale">For Sale</option>
          <option value="rental">For Rent</option>
        </select>

      </div>

      <div>

        <label className="label">
          Property
        </label>

        <select
          name="propertyType"
          defaultValue={searchParams.propertyType || ""}
          className="input mt-2"
        >
          <option value="">Any</option>

          {propertyTypeOptions.map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}

        </select>

      </div>

      <div>

        <label className="label">
          City
        </label>

        <input
          name="city"
          defaultValue={searchParams.city}
          className="input mt-2"
          placeholder="Dehradun"
        />

      </div>

      <div className="grid grid-cols-2 gap-3">

        <div>

          <label className="label">
            Min ₹
          </label>

          <input
            type="number"
            name="minPrice"
            defaultValue={searchParams.minPrice}
            className="input mt-2"
          />

        </div>

        <div>

          <label className="label">
            Max ₹
          </label>

          <input
            type="number"
            name="maxPrice"
            defaultValue={searchParams.maxPrice}
            className="input mt-2"
          />

        </div>

      </div>

    </div>

    <div className="mt-6 flex flex-wrap gap-3">

      <button
        type="submit"
        className="btn-primary"
      >
        Apply Filters
      </button>

      {Object.values(searchParams).some(Boolean) && (

        <Link
          href="/properties"
          className="btn-outline"
        >
          Clear Filters
        </Link>

      )}

    </div>

  </form>

  {/* Results */}

  <div className="mt-12">

    <div className="mb-8 flex items-center justify-between">

      <p className="text-sm text-slate">

        Showing
        <span className="font-medium text-ink">
          {" "}
          {pagination.total}
        </span>
        {" "}properties

      </p>

    </div>

    {properties.length === 0 ? (

      <div className="rounded-3xl border border-line bg-white p-16 text-center">

        <h2 className="text-2xl">
          No properties found
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate">
          Try adjusting your filters or explore all available listings.
        </p>

      </div>

    ) : (

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        {properties.map((property) => (

          <PropertyCard
            key={property._id}
            property={property}
          />

        ))}

      </div>

    )}

    {/* Pagination */}

    {pagination.pages > 1 && (

      <div className="mt-16 flex justify-center">

        <div className="flex gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm">

          {Array.from(
            { length: pagination.pages },
            (_, i) => i + 1
          ).map((p) => (

            <Link
              key={p}
              href={buildPageHref(p)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm transition ${
                p === pagination.page
                  ? "bg-ink text-paper"
                  : "hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>

          ))}

        </div>

      </div>

    )}

  </div>

</div>
  );
}
