import type { TemplateProps } from "../shared";
import { StdTemplate } from "./tpl-std-base";
import { PALETTE_EPURE } from "./tpl-std-palettes";

export function TplModerne(props: TemplateProps) {
  return <StdTemplate {...props} palette={PALETTE_EPURE} />;
}
