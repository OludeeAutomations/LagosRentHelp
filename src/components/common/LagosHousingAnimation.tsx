const LagosHousingAnimation = () => (
  <svg
    viewBox="0 0 960 600"
    role="img"
    aria-label="Animated illustration of Lagos homes, skyline, lagoon and bridge traffic"
    className="h-[280px] w-full rounded-[1.55rem] object-cover sm:h-[380px] lg:h-[475px]"
    preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="lagosSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9ed7c0" />
        <stop offset="0.58" stopColor="#d8eadf" />
        <stop offset="1" stopColor="#f4d69e" />
      </linearGradient>
      <linearGradient id="lagosWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4c9488" />
        <stop offset="1" stopColor="#173f4b" />
      </linearGradient>
      <linearGradient id="lagosLand" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5f8d63" />
        <stop offset="1" stopColor="#28543c" />
      </linearGradient>
      <pattern id="windowLights" width="20" height="22" patternUnits="userSpaceOnUse">
        <rect x="5" y="5" width="7" height="8" rx="1" fill="#ffe6a3" opacity=".8">
          <animate attributeName="opacity" values=".25;.95;.25" dur="4s" repeatCount="indefinite" />
        </rect>
      </pattern>
      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0b291d" floodOpacity=".25" />
      </filter>
    </defs>

    <rect width="960" height="600" fill="url(#lagosSky)" />
    <circle cx="770" cy="105" r="55" fill="#ffd875" opacity=".95">
      <animate attributeName="r" values="52;58;52" dur="7s" repeatCount="indefinite" />
    </circle>

    <g fill="#fff" opacity=".58">
      <g>
        <ellipse cx="95" cy="112" rx="48" ry="18" /><ellipse cx="132" cy="105" rx="35" ry="23" /><ellipse cx="164" cy="114" rx="43" ry="16" />
        <animateTransform attributeName="transform" type="translate" values="-190 0;980 0" dur="42s" repeatCount="indefinite" />
      </g>
      <g opacity=".7">
        <ellipse cx="90" cy="174" rx="38" ry="14" /><ellipse cx="119" cy="166" rx="29" ry="20" /><ellipse cx="146" cy="174" rx="35" ry="13" />
        <animateTransform attributeName="transform" type="translate" values="980 0;-190 0" dur="55s" repeatCount="indefinite" />
      </g>
    </g>

    <path d="M0 320C160 295 270 329 405 306c146-25 269-4 555-45v339H0Z" fill="url(#lagosWater)" />
    <g fill="none" stroke="#b8e0d2" strokeLinecap="round" opacity=".33">
      <path d="M50 430c125-26 240 22 366-4 137-28 269 21 468-11"><animate attributeName="d" values="M50 430c125-26 240 22 366-4 137-28 269 21 468-11;M30 438c145 18 245-24 380 2 160 30 286-25 484-5;M50 430c125-26 240 22 366-4 137-28 269 21 468-11" dur="8s" repeatCount="indefinite" /></path>
      <path d="M90 500c170 22 265-20 392 5 120 23 237-14 394-2"><animate attributeName="opacity" values=".18;.55;.18" dur="5s" repeatCount="indefinite" /></path>
      <path d="M230 555c110-17 208 13 330-4 104-15 203 8 315-7" />
    </g>

    <g opacity=".9">
      <rect x="48" y="214" width="70" height="126" rx="4" fill="#356956" /><rect x="58" y="225" width="50" height="98" fill="url(#windowLights)" />
      <rect x="126" y="178" width="82" height="162" rx="4" fill="#214f42" /><rect x="138" y="191" width="58" height="132" fill="url(#windowLights)" />
      <rect x="216" y="235" width="62" height="105" rx="3" fill="#567766" /><rect x="286" y="151" width="88" height="189" rx="4" fill="#315c50" /><rect x="299" y="166" width="62" height="157" fill="url(#windowLights)" />
      <path d="M310 151h41l-20-36Z" fill="#23483c" />
      <rect x="384" y="205" width="60" height="135" rx="3" fill="#47725f" /><rect x="452" y="172" width="79" height="168" rx="4" fill="#295747" /><rect x="464" y="188" width="55" height="134" fill="url(#windowLights)" />
      <rect x="542" y="224" width="68" height="116" rx="3" fill="#658472" /><rect x="620" y="183" width="72" height="157" rx="4" fill="#386653" /><rect x="631" y="197" width="50" height="126" fill="url(#windowLights)" />
      <rect x="702" y="236" width="63" height="104" rx="3" fill="#557967" /><rect x="775" y="196" width="75" height="144" rx="4" fill="#2d5c4a" /><rect x="786" y="210" width="53" height="112" fill="url(#windowLights)" />
      <rect x="860" y="230" width="58" height="110" rx="3" fill="#466d5a" />
    </g>

    <path d="M-40 348C194 331 343 354 505 375c169 22 310 24 505 3" fill="none" stroke="#1d322d" strokeWidth="45" />
    <path d="M-40 342C194 325 343 348 505 369c169 22 310 24 505 3" fill="none" stroke="#d8d3c7" strokeWidth="29" />
    <path d="M-40 342C194 325 343 348 505 369c169 22 310 24 505 3" fill="none" stroke="#fff7d4" strokeWidth="2" strokeDasharray="20 20" opacity=".85" />
    <g fill="#e7ece8">
      <path d="M105 337v75h8v-76ZM352 345v91h8v-90ZM610 374v83h8v-82ZM850 378v69h8v-69Z" />
    </g>

    <g filter="url(#softShadow)">
      <g>
        <rect x="-24" y="-9" width="32" height="15" rx="4" fill="#f6c344" /><circle cx="-16" cy="7" r="4" fill="#17231f" /><circle cx="1" cy="7" r="4" fill="#17231f" />
        <animateMotion dur="8s" repeatCount="indefinite" path="M-40 337 C200 320 360 347 520 367 C700 390 820 384 1030 366" />
      </g>
      <g>
        <rect x="-22" y="-9" width="31" height="15" rx="4" fill="#ef6d5b" /><circle cx="-14" cy="7" r="4" fill="#17231f" /><circle cx="2" cy="7" r="4" fill="#17231f" />
        <animateMotion dur="11s" begin="-5s" repeatCount="indefinite" path="M1030 383 C810 401 685 400 500 377 C330 356 174 337 -50 355" />
      </g>
    </g>

    <path d="M0 489c125-40 236-22 347 7 119 31 235 34 333 0 98-35 185-39 280-10v114H0Z" fill="url(#lagosLand)" />
    <g filter="url(#softShadow)">
      <g transform="translate(82 443)"><rect width="172" height="105" rx="6" fill="#f5ead1" /><path d="m-14 4 100-61L186 4Z" fill="#a54b37" /><rect x="26" y="35" width="34" height="31" rx="2" fill="#79a99c" /><rect x="105" y="24" width="42" height="81" fill="#704b35" /><rect x="110" y="31" width="30" height="39" fill="#d0ded6" /></g>
      <g transform="translate(300 470)"><rect width="140" height="90" rx="5" fill="#f1d89e" /><path d="m-12 3 82-50 82 50Z" fill="#315846" /><rect x="24" y="30" width="31" height="27" fill="#79a99c" /><rect x="91" y="26" width="30" height="64" fill="#75513b" /></g>
      <g transform="translate(696 446)"><rect width="185" height="110" rx="6" fill="#f5ead1" /><path d="m-15 4 107-64L200 4Z" fill="#b86242" /><rect x="25" y="31" width="38" height="34" fill="#79a99c" /><rect x="121" y="26" width="37" height="84" fill="#6d4937" /></g>
    </g>
    <g fill="#143e2a">
      <path d="M40 522h10v78H40Z" /><path d="m45 522-31-31 32 11 13-38 7 39 35-15-28 36Z" />
      <path d="M906 506h9v94h-9Z" /><path d="m911 506-34-35 35 13 16-41 6 42 36-14-30 37Z" />
    </g>
  </svg>
);

export default LagosHousingAnimation;
