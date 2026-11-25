import type { TemplateProps } from "../shared";
import { StdTemplate } from "./tpl-std-base";
import { PALETTE_VERT } from "./tpl-std-palettes";

export function TplMarche(props: TemplateProps) {
  return <StdTemplate {...props} palette={PALETTE_VERT} />;
}
