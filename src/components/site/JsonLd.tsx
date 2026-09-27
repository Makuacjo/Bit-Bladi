// Renders one or more JSON-LD structured-data blobs. `<` is escaped so the
// serialized JSON can never break out of the <script> element.
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blobs = Array.isArray(data) ? data : [data];
  return (
    <>
      {blobs.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blob).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
