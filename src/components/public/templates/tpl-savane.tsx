import type { TemplateProps } from "../shared";
import { StdTemplate } from "./tpl-std-base";
import { PALETTE_SAVANE } from "./tpl-std-palettes";

export function TplSavane(props: TemplateProps) {
  return <StdTemplate {...props} palette={PALETTE_SAVANE} />;
}
