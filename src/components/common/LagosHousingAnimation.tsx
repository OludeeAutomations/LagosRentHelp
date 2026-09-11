const LagosHousingAnimation = () => (
  <div className="relative h-[280px] w-full overflow-visible sm:h-[380px] lg:h-[475px]">
  <svg
    viewBox="0 0 960 600"
    role="img"
    aria-label="Mosaic illustration of Eko Bridge crossing the Lagos lagoon"
    className="h-full w-full rounded-[1.55rem] object-cover"
    preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="ekoWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#287d78" />
        <stop offset="1" stopColor="#123f48" />
      </linearGradient>
      <filter id="ekoShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#071d17" floodOpacity=".3" />
      </filter>
      <clipPath id="ekoFrame"><rect width="960" height="600" rx="34" /></clipPath>
    </defs>

    <g clipPath="url(#ekoFrame)">
      <rect width="960" height="600" fill="#aadbc9" />

      {/* Mosaic sky */}
      <g stroke="#d9eee5" strokeWidth="3">
        <path d="M0 0h170l-28 118L0 144Z" fill="#9ed4c0" />
        <path d="M170 0h155l28 106-211 12Z" fill="#b8e2d1" />
        <path d="M325 0h180l-17 135-135-29Z" fill="#91ccb8" />
        <path d="M505 0h161l25 117-203 18Z" fill="#bce5d4" />
        <path d="M666 0h163l-15 128-123-11Z" fill="#9bd2bd" />
        <path d="M829 0h131v143l-146-15Z" fill="#b6dfce" />
        <path d="M0 144l142-26 53 112L0 252Z" fill="#b8dfcf" />
        <path d="m142 118 211-12-9 139-149-15Z" fill="#a5d7c3" />
        <path d="m353 106 135 29 29 112-173-2Z" fill="#bce4d3" />
        <path d="m488 135 203-18-37 136-137-6Z" fill="#9dcfbb" />
        <path d="m691 117 123 11 32 120-192 5Z" fill="#b4ddcc" />
        <path d="m814 128 146 15v110l-114-5Z" fill="#9bcfba" />
      </g>

      {/* Four-piece mosaic sun */}
      <g stroke="#fff0bc" strokeWidth="3">
        <path d="M790 45a68 68 0 0 1 68 68h-68Z" fill="#ffd16d" />
        <path d="M858 113a68 68 0 0 1-68 68v-68Z" fill="#f6bd55" />
        <path d="M790 181a68 68 0 0 1-68-68h68Z" fill="#ffda7d" />
        <path d="M722 113a68 68 0 0 1 68-68v68Z" fill="#f8c45d" />
      </g>

      {/* Lagos skyline tiles */}
      <g stroke="#bdd7cc" strokeWidth="2">
        <path d="M0 191h76v155H0Z" fill="#356554" /><path d="M76 241h68v105H76Z" fill="#507565" />
        <path d="M144 164h94v182h-94Z" fill="#285746" /><path d="m167 164 24-42 24 42Z" fill="#214a3c" />
        <path d="M238 225h79v121h-79Z" fill="#5f8170" /><path d="M317 190h88v156h-88Z" fill="#356555" />
        <path d="M405 238h73v108h-73Z" fill="#6d8c7a" /><path d="M478 174h94v172h-94Z" fill="#2e604e" />
        <path d="M572 222h83v124h-83Z" fill="#527764" /><path d="M655 196h86v150h-86Z" fill="#376653" />
        <path d="M741 233h72v113h-72Z" fill="#668675" /><path d="M813 184h92v162h-92Z" fill="#2b5d4b" />
        <path d="M905 229h55v117h-55Z" fill="#557968" />
      </g>
      <g fill="#f7df91" opacity=".82">
        {[
          [20,215],[47,215],[162,192],[193,192],[162,225],[193,225],[340,216],[372,216],
          [498,202],[530,202],[498,238],[530,238],[676,221],[708,221],[836,211],[870,211],
          [20,251],[47,251],[162,258],[193,258],[340,252],[372,252],[498,274],[530,274],[676,257],[836,247],[870,247],
        ].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="12" height="14" rx="2" />)}
      </g>

      {/* Lagoon mosaic */}
      <rect y="346" width="960" height="254" fill="url(#ekoWater)" />
      <g stroke="#438c86" strokeWidth="2">
        <path d="M0 346h215l-55 92L0 421Z" fill="#337f78" /><path d="m215 346 194 0 26 97-275-5Z" fill="#246d6b" />
        <path d="m409 346 204 0-39 101-139-4Z" fill="#39857d" /><path d="m613 346 190 0 19 92-248 9Z" fill="#246b6b" />
        <path d="m803 346 157 0v84l-138 8Z" fill="#397d76" /><path d="M0 421l160 17 35 93L0 551Z" fill="#276b6c" />
        <path d="m160 438 275 5-54 108-186-20Z" fill="#3d8178" /><path d="m435 443 139 4 62 100-255 4Z" fill="#246a68" />
        <path d="m574 447 248-9-18 110-168-1Z" fill="#3d847b" /><path d="m822 438 138-8v121l-156-3Z" fill="#266a68" />
        <path d="M0 551l195-20 36 69H0Z" fill="#367a71" /><path d="m195 531 186 20 23 49H231Z" fill="#286866" />
        <path d="m381 551 255-4-17 53H404Z" fill="#397c72" /><path d="m636 547 168 1 45 52H619Z" fill="#236663" />
        <path d="m804 548 156 3v49H849Z" fill="#35786e" />
      </g>

      {/* Eko Bridge */}
      <g filter="url(#ekoShadow)">
        <path d="M-30 324C178 299 323 326 472 354c172 32 308 36 518 6" fill="none" stroke="#18332d" strokeWidth="58" />
        <path d="M-30 316C178 291 323 318 472 346c172 32 308 36 518 6" fill="none" stroke="#e4dfd1" strokeWidth="39" />
        <path d="M-30 316C178 291 323 318 472 346c172 32 308 36 518 6" fill="none" stroke="#fff8d7" strokeWidth="3" strokeDasharray="24 18" />
        <g fill="#dae2dc">
          <path d="M92 303h12v145H92Z" /><path d="M292 308h12v164h-12Z" /><path d="M493 342h12v144h-12Z" />
          <path d="M699 356h12v127h-12Z" /><path d="M886 354h12v109h-12Z" />
        </g>
      </g>

      {/* Moving Lagos traffic */}
      <g filter="url(#ekoShadow)">
        <g><rect x="-27" y="-11" width="40" height="18" rx="5" fill="#f0bd3d" /><circle cx="-18" cy="8" r="5" fill="#15251f" /><circle cx="5" cy="8" r="5" fill="#15251f" /><animateMotion dur="8s" repeatCount="indefinite" path="M-30 309 C180 284 330 315 480 341 C650 371 790 370 1010 345" /></g>
        <g><rect x="-25" y="-11" width="39" height="18" rx="5" fill="#e96354" /><circle cx="-16" cy="8" r="5" fill="#15251f" /><circle cx="7" cy="8" r="5" fill="#15251f" /><animateMotion dur="11s" begin="-4s" repeatCount="indefinite" path="M1010 366 C800 394 650 383 470 353 C320 327 175 302 -35 326" /></g>
      </g>

      {/* Canoes and water reflections */}
      <g>
        <g transform="translate(204 486)"><path d="M0 0h79l-16 13H14Z" fill="#f0b747" /><path d="M39-31v31M39-29l32 22H40Z" stroke="#e9f4ed" strokeWidth="4" fill="#d9684e" /></g>
        <g transform="translate(690 518) scale(.8)"><path d="M0 0h86l-19 14H15Z" fill="#e86c55" /><path d="M42-35v35M42-33 8-8h34Z" stroke="#eef7f2" strokeWidth="4" fill="#f0c45b" /></g>
        <path d="M130 558c82-15 155 13 243-1M510 526c98-14 175 16 281 1" fill="none" stroke="#9bc8ba" strokeWidth="5" strokeLinecap="round" opacity=".45" />
      </g>
    </g>
  </svg>

    {/* The bridge crown deliberately breaks out of the image frame. */}
    <svg
      viewBox="0 0 360 150"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 z-20 h-28 w-[66%] -translate-x-1/2 -translate-y-[58%] overflow-visible drop-shadow-[0_10px_9px_rgba(7,29,23,0.35)] sm:h-36 sm:w-[62%]">
      <path d="M18 143Q180-35 342 143" fill="none" stroke="#173f2f" strokeWidth="31" strokeLinecap="round" />
      <path d="M18 143Q180-35 342 143" fill="none" stroke="#4d8976" strokeWidth="16" strokeLinecap="round" strokeDasharray="58 8" />
      <path d="M50 139 90 93M96 84l34-29M142 48l24-17M310 139l-40-46M264 84l-34-29M218 48l-24-17" fill="none" stroke="#d3e7df" strokeWidth="3" opacity=".9" />
      <path d="M166 135V25h28v110" fill="#204f3e" stroke="#7dac9a" strokeWidth="4" />
      <path d="M166 55h28M166 92h28" stroke="#d3e7df" strokeWidth="4" />
    </svg>
  </div>
);

export default LagosHousingAnimation;
