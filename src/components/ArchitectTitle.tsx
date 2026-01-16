import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import bear character images for each letter
import bearT from '@/assets/bear-letter-t.png';
import bearH from '@/assets/bear-letter-h.png';
import bearE from '@/assets/bear-letter-e.png';
import bearA from '@/assets/bear-letter-a.png';
import bearR from '@/assets/bear-letter-r.png';
import bearC from '@/assets/bear-letter-c.png';
import bearI from '@/assets/bear-letter-i.png';

interface LetterConfig {
  letter: string;
  image: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'inside';
  offset: { x: number; y: number };
}

const letterConfigs: LetterConfig[] = [
  { letter: 'T', image: bearT, position: 'top', offset: { x: 0, y: -60 } },
  { letter: 'H', image: bearH, position: 'top', offset: { x: 0, y: -55 } },
  { letter: 'E', image: bearE, position: 'right', offset: { x: 30, y: -20 } },
  { letter: ' ', image: '', position: 'inside', offset: { x: 0, y: 0 } },
  { letter: 'A', image: bearA, position: 'bottom', offset: { x: 0, y: 35 } },
  { letter: 'R', image: bearR, position: 'right', offset: { x: 25, y: -15 } },
  { letter: 'C', image: bearC, position: 'inside', offset: { x: -5, y: -30 } },
  { letter: 'H', image: bearH, position: 'top', offset: { x: 0, y: -55 } },
  { letter: 'I', image: bearI, position: 'left', offset: { x: -40, y: -15 } },
  { letter: 'T', image: bearT, position: 'top', offset: { x: 0, y: -60 } },
  { letter: 'E', image: bearE, position: 'right', offset: { x: 30, y: -20 } },
  { letter: 'C', image: bearC, position: 'inside', offset: { x: -5, y: -30 } },
  { letter: 'T', image: bearT, position: 'top', offset: { x: 0, y: -60 } },
];

const ArchitectTitle = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative flex flex-wrap justify-center items-center gap-1 md:gap-2">
      {letterConfigs.map((config, index) => (
        <div
          key={index}
          className="relative inline-block"
          onMouseEnter={() => config.letter !== ' ' && setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* The Letter */}
          <motion.span
            className={`
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold
              bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-transparent
              cursor-pointer select-none inline-block
              ${config.letter === ' ' ? 'w-4 md:w-6' : ''}
            `}
            animate={{
              scale: hoveredIndex === index ? 1.1 : 1,
              y: hoveredIndex === index ? -5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {config.letter === ' ' ? '\u00A0' : config.letter}
          </motion.span>

          {/* Bear Character */}
          <AnimatePresence>
            {hoveredIndex === index && config.image && (
              <motion.div
                className="absolute z-50 pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0.3,
                  x: `calc(-50% + ${config.offset.x}px)`,
                  y: `calc(-50% + ${config.offset.y}px)`,
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: `calc(-50% + ${config.offset.x}px)`,
                  y: `calc(-50% + ${config.offset.y}px)`,
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.3,
                  x: `calc(-50% + ${config.offset.x}px)`,
                  y: `calc(-50% + ${config.offset.y}px)`,
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 25,
                  duration: 0.3
                }}
              >
                <motion.img
                  src={config.image}
                  alt={`Bear with letter ${config.letter}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-lg"
                  animate={{
                    rotate: [0, -3, 3, -3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ArchitectTitle;
