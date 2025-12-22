export function isNotZeroCss(value?: string): false | string | undefined {
  return (
    value && !/^0(px|%|r?em|vw|vh|vmin|vmax|cm|mm|in|pt|pc|ex|ch)?$/i.test(value.trim()) && value
  );
}
