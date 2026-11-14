import type { LayoutTemplate } from "@/types/schema";
import { AppStoreTemplate } from "./appstore";
import { BentoTemplate } from "./bento";
import { BrutalistTemplate } from "./brutalist";
import { HeroTemplate } from "./hero";
import { ListTemplate } from "./list";
import type { TemplateProps } from "./types";

export const TEMPLATE_COMPONENTS: Record<LayoutTemplate, (props: TemplateProps) => React.ReactNode> = {
  template_a_bento: BentoTemplate,
  template_b_list: ListTemplate,
  template_c_hero: HeroTemplate,
  template_d_appstore: AppStoreTemplate,
  template_e_brutalist: BrutalistTemplate,
};
