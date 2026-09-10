export function positions(full, view) {
  if (full <= view) return [0];
  const list = [];
  for (let v = 0; v < full; v += view) list.push(v);
  const last = Math.max(0, full - view);
  if (list[list.length - 1] !== last) list[list.length - 1] = last;
  return list;
}
