import { SaaSHero } from "@/components/sections/SaaSHero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturedOpportunities } from "@/components/sections/FeaturedOpportunities";
import { SocialProof } from "@/components/sections/SocialProof";
import { CallToAction } from "@/components/sections/CallToAction";

export default function HomePage() {
  return (
    <div>
      <SaaSHero />
      <HowItWorks />
      <FeaturedOpportunities />
      <SocialProof />
      <CallToAction />
    </div>
  );
}
