import React from 'react';

const AnimatedHouseBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-3">
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple House Pattern - Scattered */}
        <g className="text-gray-300">
          {/* Row 1 */}
          <g transform="translate(100, 150)">
            <rect width="60" height="40" fill="currentColor" />
            <polygon points="0,0 30,20 60,0" fill="currentColor" opacity="0.8" />
            <rect x="10" y="10" width="8" height="12" fill="currentColor" opacity="0.6" />
            <rect x="35" y="12" width="12" height="10" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(300, 120)">
            <rect width="50" height="35" fill="currentColor" />
            <polygon points="0,0 25,15 50,0" fill="currentColor" opacity="0.8" />
            <rect x="8" y="8" width="6" height="10" fill="currentColor" opacity="0.6" />
            <rect x="28" y="10" width="10" height="8" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(500, 140)">
            <rect width="55" height="38" fill="currentColor" />
            <polygon points="0,0 27.5,18 55,0" fill="currentColor" opacity="0.8" />
            <rect x="9" y="9" width="7" height="11" fill="currentColor" opacity="0.6" />
            <rect x="32" y="11" width="11" height="9" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(750, 110)">
            <rect width="45" height="32" fill="currentColor" />
            <polygon points="0,0 22.5,14 45,0" fill="currentColor" opacity="0.8" />
            <rect x="7" y="7" width="5" height="9" fill="currentColor" opacity="0.6" />
            <rect x="25" y="9" width="9" height="7" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(950, 130)">
            <rect width="58" height="39" fill="currentColor" />
            <polygon points="0,0 29,17 58,0" fill="currentColor" opacity="0.8" />
            <rect x="10" y="10" width="8" height="12" fill="currentColor" opacity="0.6" />
            <rect x="33" y="12" width="12" height="10" fill="currentColor" opacity="0.6" />
          </g>
          
          {/* Row 2 */}
          <g transform="translate(150, 300)">
            <rect width="52" height="36" fill="currentColor" />
            <polygon points="0,0 26,16 52,0" fill="currentColor" opacity="0.8" />
            <rect x="8" y="8" width="6" height="10" fill="currentColor" opacity="0.6" />
            <rect x="30" y="10" width="10" height="8" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(350, 280)">
            <rect width="48" height="34" fill="currentColor" />
            <polygon points="0,0 24,15 48,0" fill="currentColor" opacity="0.8" />
            <rect x="7" y="7" width="5" height="9" fill="currentColor" opacity="0.6" />
            <rect x="28" y="9" width="9" height="7" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(600, 320)">
            <rect width="56" height="38" fill="currentColor" />
            <polygon points="0,0 28,17 56,0" fill="currentColor" opacity="0.8" />
            <rect x="9" y="9" width="7" height="11" fill="currentColor" opacity="0.6" />
            <rect x="32" y="11" width="11" height="9" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(850, 290)">
            <rect width="44" height="31" fill="currentColor" />
            <polygon points="0,0 22,14 44,0" fill="currentColor" opacity="0.8" />
            <rect x="6" y="6" width="5" height="8" fill="currentColor" opacity="0.6" />
            <rect x="26" y="8" width="8" height="6" fill="currentColor" opacity="0.6" />
          </g>
          
          {/* Row 3 */}
          <g transform="translate(80, 480)">
            <rect width="54" height="37" fill="currentColor" />
            <polygon points="0,0 27,16 54,0" fill="currentColor" opacity="0.8" />
            <rect x="8" y="8" width="6" height="10" fill="currentColor" opacity="0.6" />
            <rect x="31" y="10" width="10" height="8" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(280, 450)">
            <rect width="49" height="35" fill="currentColor" />
            <polygon points="0,0 24.5,15 49,0" fill="currentColor" opacity="0.8" />
            <rect x="7" y="7" width="5" height="9" fill="currentColor" opacity="0.6" />
            <rect x="29" y="9" width="9" height="7" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(480, 470)">
            <rect width="57" height="39" fill="currentColor" />
            <polygon points="0,0 28.5,17 57,0" fill="currentColor" opacity="0.8" />
            <rect x="9" y="9" width="7" height="11" fill="currentColor" opacity="0.6" />
            <rect x="33" y="11" width="11" height="9" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(720, 440)">
            <rect width="46" height="33" fill="currentColor" />
            <polygon points="0,0 23,15 46,0" fill="currentColor" opacity="0.8" />
            <rect x="7" y="7" width="5" height="9" fill="currentColor" opacity="0.6" />
            <rect x="27" y="9" width="9" height="7" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(920, 460)">
            <rect width="53" height="36" fill="currentColor" />
            <polygon points="0,0 26.5,16 53,0" fill="currentColor" opacity="0.8" />
            <rect x="8" y="8" width="6" height="10" fill="currentColor" opacity="0.6" />
            <rect x="30" y="10" width="10" height="8" fill="currentColor" opacity="0.6" />
          </g>
          
          {/* Row 4 */}
          <g transform="translate(200, 620)">
            <rect width="51" height="35" fill="currentColor" />
            <polygon points="0,0 25.5,15 51,0" fill="currentColor" opacity="0.8" />
            <rect x="8" y="8" width="6" height="10" fill="currentColor" opacity="0.6" />
            <rect x="29" y="10" width="10" height="8" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(400, 600)">
            <rect width="47" height="33" fill="currentColor" />
            <polygon points="0,0 23.5,14 47,0" fill="currentColor" opacity="0.8" />
            <rect x="7" y="7" width="5" height="9" fill="currentColor" opacity="0.6" />
            <rect x="28" y="9" width="9" height="7" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(650, 630)">
            <rect width="55" height="38" fill="currentColor" />
            <polygon points="0,0 27.5,17 55,0" fill="currentColor" opacity="0.8" />
            <rect x="9" y="9" width="7" height="11" fill="currentColor" opacity="0.6" />
            <rect x="32" y="11" width="11" height="9" fill="currentColor" opacity="0.6" />
          </g>
          
          <g transform="translate(880, 610)">
            <rect width="48" height="34" fill="currentColor" />
            <polygon points="0,0 24,15 48,0" fill="currentColor" opacity="0.8" />
            <rect x="7" y="7" width="5" height="9" fill="currentColor" opacity="0.6" />
            <rect x="29" y="9" width="9" height="7" fill="currentColor" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedHouseBackground;