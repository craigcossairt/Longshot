function jpegToPdfBlob(jpeg, width, height, title) {
  const payload = jpeg;
  const w = width;
  const h = height;
  const objects = [];
  function add(body) {
    objects.push(body);
    return objects.length;
  }
  const id1 = add("<< /Type /Catalog /Pages 2 0 R >>");
  const id2 = add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const id3 = add(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>`,
  );
  const stream = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
  const id4 = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  const id5 = add(
    `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${payload.byteLength} >>\nstream\n`,
  );
  const encoder = new TextEncoder();
  const header = encoder.encode("%PDF-1.4\n");
  const chunks = [header];
  let offset = header.length;
  const xref = [0];
  const parts = [];
  for (let i = 0; i < objects.length; i++) {
    const n = i + 1;
    let body = encoder.encode(`${n} 0 obj\n${objects[i]}`);
    if (n === 5) {
      const end = encoder.encode("\nendstream\nendobj\n");
      xref.push(offset);
      chunks.push(body, payload, end);
      offset += body.length + payload.byteLength + end.length;
    } else {
      const end = encoder.encode("\nendobj\n");
      xref.push(offset);
      chunks.push(body, end);
      offset += body.length + end.length;
    }
    parts.push(n);
  }
  const xrefStart = offset;
  let xrefTable = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < xref.length; i++) {
    xrefTable += `${String(xref[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R /Info << /Title (${(title || "Capture").replace(/[()]/g, "")}) >> >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(encoder.encode(xrefTable + trailer));
  return new Blob(chunks, { type: "application/pdf" });
}
