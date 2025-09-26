// import React from "react";
import { Button } from "../../components/ui/button";
import { AnalyticsOverviewSection } from "./sections/AnalyticsOverviewSection/AnalyticsOverviewSection";
import { UserProfileSection } from "./sections/UserProfileSection/UserProfileSection";
import { RocketIcon } from "lucide-react"; // Pick an icon you like

export const WopeCom = (): JSX.Element => {
  return (
    <div className="bg-[#0a0118] overflow-x-hidden w-full min-h-screen relative">
      <header className="flex w-full max-w-[1440px] mx-auto items-center justify-between px-24 py-[22px] absolute top-0 left-1/2 transform -translate-x-1/2 bg-transparent z-10">
        <div className="flex items-center space-x-2">
          <RocketIcon className="w-6 h-6 text-white" />
          <span className="text-white text-lg font-semibold tracking-tight">
            Manisha Rani
          </span>
        </div>

        <div className="w-full max-w-[1440px] top-[77px] h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.16)_50%,rgba(255,255,255,0)_100%)] absolute left-1/2 transform -translate-x-1/2" />

        <div className="inline-flex items-center relative flex-[0_0_auto]">
          <Button
            variant="ghost"
            className="pl-[25px] pr-[26.72px] pt-1 pb-1.5 relative flex-[0_0_auto] inline-flex items-start justify-center rounded-[999px] h-auto [font-family:'Roboto',Helvetica] font-medium text-white text-sm text-center tracking-[-0.14px] leading-6 whitespace-nowrap hover:bg-white/10 hover:text-white"
          >
            Log in
          </Button>

          <div className="inline-flex items-start relative flex-[0_0_auto] rounded-[999px] overflow-hidden">
            <Button
              className="
          px-6 
          py-2 
          relative 
          flex-shrink-0 
          border border-white/10 
          rounded-full 
          bg-white/10 
          backdrop-blur-md 
          text-white 
          font-medium 
          text-sm 
          tracking-tight 
          leading-6 
          whitespace-nowrap 
          transition 
          hover:bg-white/20 
          hover:text-white
        "
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <img
        className="absolute top-[83px] left-1/2 transform -translate-x-1/2 w-full max-w-[1440px] h-[955px]"
        alt="Div hero background"
        src="/div-hero-background.svg"
      />

      <main className="relative pt-[100px]">
        <UserProfileSection />
        <AnalyticsOverviewSection />
      </main>

      <img
        className="hidden"
        alt="Region chat widget"
        src="/region---chat-widget.svg"
      />
    </div>
  );
};
