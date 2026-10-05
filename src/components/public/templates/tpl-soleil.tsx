import type { TemplateProps } from "../shared";
import { StdTemplate } from "./tpl-std-base";
import { PALETTE_SOLEIL } from "./tpl-std-palettes";

export function TplSoleil(props: TemplateProps) {
  return <StdTemplate {...props} palette={PALETTE_SOLEIL} />;
}
