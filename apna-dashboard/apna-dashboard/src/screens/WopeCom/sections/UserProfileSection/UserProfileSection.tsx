// import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

export const UserProfileSection = (): JSX.Element => {
  return (
    <section className="flex w-full h-[1155px] items-start pt-[120px] pb-0 px-4 md:px-24 relative top-[-5px] left-0 overflow-hidden">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[1640px] h-[1331px] [background:radial-gradient(50%_50%_at_50%_50%,rgba(113,61,255,0.06)_0%,rgba(113,61,255,0)_100%),radial-gradient(50%_50%_at_50%_50%,rgba(113,61,255,0.2)_0%,rgba(113,61,255,0)_100%)]" />

      <div className="flex w-full max-w-[1440px] items-start justify-center px-4 md:px-[185px] py-0 absolute top-9 left-1/2 transform -translate-x-1/2">
        <img className="hidden" alt="Div star animation" />

        <img
          className="relative w-full max-w-[1070px] h-auto"
          alt="Image"
          src="/image-6.png"
        />
      </div>

      <div className="relative w-full max-w-[1248px] mx-auto h-[1080.39px] mb-[-45.39px]">
        <h1 className="absolute top-[78px] left-1/2 transform -translate-x-1/2 w-full max-w-[798px] h-20 flex items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,1)_22%,rgba(255,255,255,0.7)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Roboto',Helvetica] font-bold text-transparent text-4xl md:text-7xl text-center tracking-[-1.44px] leading-[40px] md:leading-[80px]">
          New Era of Rank Tracking
        </h1>

        <div className="flex max-w-[620px] w-full items-start justify-center px-4 py-0 absolute top-[170px] left-1/2 transform -translate-x-1/2">
          <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#d2d0dd] text-lg md:text-xl text-center tracking-[-0.20px] leading-7">
            Find out what&#39;s working and what&#39;s not to get more search
            traffic.
            <br />
            Like an SEO consultant who can analyze millions of data.
          </p>
        </div>

        <div className="flex flex-col w-full items-center gap-3 px-4 md:px-[447px] py-0 absolute top-[250px] left-0">
          <div className="relative w-full max-w-md mx-auto z-[1]">
            <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-sm">
              {/* Input */}
              <Input
                type="text"
                placeholder="Enter your domain"
                className="flex-1 bg-transparent border-none text-sm text-white placeholder-white/50 focus:outline-none focus:ring-0"
              />

              {/* Button */}
              <Button
                className="
            ml-2
            px-5 py-2 
            rounded-full 
            border border-white/10 
            bg-white/10 
            text-sm font-medium 
            text-white 
            backdrop-blur-md 
            hover:bg-white/20 
            transition 
            whitespace-nowrap
          "
              >
                Try Demo
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[1248px] items-start px-6 py-0 absolute top-[429px] left-1/2 transform -translate-x-1/2">
          <div className="flex w-full max-w-[1200px] h-[651px] items-start relative">
            <div className="relative w-full h-[651px] rounded-[10px] bg-[linear-gradient(180deg,rgba(169,163,194,0.2)_0%,rgba(169,163,194,0.05)_100%)]">
              <div className="relative w-[calc(100%_-_2px)] h-[calc(100%_-_2px)] top-px left-px bg-[#0a011833] rounded-[10px] overflow-hidden">
                <img
                  className="absolute w-full h-full top-0 left-0"
                  alt="Picture hero video"
                  src="/picture---hero-video-preview-png.png"
                />

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[137px] h-5 flex items-center justify-center [font-family:'Roboto',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-[18.4px] whitespace-nowrap">
                  Copy to Clipboard
                </div>
              </div>
            </div>

            <div className="w-full h-full top-0 bg-[linear-gradient(0deg,rgba(10,1,24,1)_0%,rgba(0,0,0,0)_100%)] absolute left-0" />
          </div>

          <Button className="absolute w-[100px] top-[215px] left-1/2 transform -translate-x-1/2 bg-transparent border-none p-0">
            <img
              className="w-full h-full"
              alt="Div hero video play"
              src="/div-hero-video-play.svg"
            />
          </Button>
        </div>
      </div>
    </section>
  );
};
