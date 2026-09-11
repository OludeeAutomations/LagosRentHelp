import { MapPin } from "lucide-react";

const LocationPulse = ({ className, delay }: { className: string; delay: string }) => (
  <span className={`pointer-events-none absolute z-20 ${className}`} aria-hidden="true">
    <span className="absolute inset-0 animate-ping rounded-full bg-amber-300/75" style={{ animationDelay: delay }} />
    <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#ef5b3f] text-white shadow-lg shadow-black/35 sm:h-9 sm:w-9">
      <MapPin className="h-4 w-4 fill-white/20 sm:h-5 sm:w-5" strokeWidth={2.5} />
    </span>
  </span>
);

const LagosHousingAnimation = () => (
  <div className="relative h-[300px] w-full overflow-visible sm:h-[410px] lg:h-[485px]">
    <img
      src="/eko-bridge-mosaic.png"
      alt="Colourful mosaic artwork of the Lagos bridge and surrounding city"
      className="absolute inset-0 h-full w-full object-contain object-center drop-shadow-[0_18px_24px_rgba(7,29,23,0.35)]"
      style={{ clipPath: "inset(15% 0 0 round 1.55rem)" }}
    />
    <img src="/eko-bridge-mosaic.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain object-center drop-shadow-[0_8px_6px_rgba(7,29,23,0.3)]" style={{ clipPath: "polygon(64.4% 3.5%, 67.4% 3.5%, 69.2% 16%, 65.8% 16%)" }} />
    <img src="/eko-bridge-mosaic.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain object-center drop-shadow-[0_8px_6px_rgba(7,29,23,0.3)]" style={{ clipPath: "polygon(73.1% 3.5%, 75.7% 3.5%, 73.7% 16%, 70.5% 16%)" }} />
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[15%] rounded-[1.55rem] ring-1 ring-inset ring-white/20" />
    <LocationPulse className="left-[20%] top-[40%]" delay="0s" />
    <LocationPulse className="left-[42%] top-[34%]" delay=".65s" />
    <LocationPulse className="right-[7%] top-[39%]" delay="1.3s" />
  </div>
);

export default LagosHousingAnimation;
