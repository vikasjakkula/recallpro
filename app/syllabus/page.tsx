"use client";
import React from "react";

const mathTopics = [
  {
    title: "I. ALGEBRA",
    topics: [
      "1. Functions",
      "2. Mathematical Induction",
      "3. Matrices and Determinants",
      "4. Complex Numbers",
      "5. Quadratic Expressions",
      "6. Theory of Equations",
      "7. Permutations and Combinations",
      "8. Binomial Theorem",
      "9. Partial Fractions",
      "10. Logarithms",
      "11. Progressions (A.P., G.P., H.P.)",
      "12. Mathematical Logic",
      "13. Linear Inequations"
    ]
  },
  {
    title: "II. TRIGONOMETRY",
    topics: [
      "1. Trigonometric Ratios and Identities",
      "2. Trigonometric Equations",
      "3. Inverse Trigonometric Functions",
      "4. Properties of Triangles",
      "5. Heights and Distances",
      "6. Hyperbolic Functions"
    ]
  },
  {
    title: "III. VECTOR ALGEBRA",
    topics: [
      "1. Addition of Vectors",
      "2. Product of Vectors"
    ]
  },
  {
    title: "IV. GEOMETRY",
    topics: [
      "1. Locus",
      "2. Transformation of Axes",
      "3. Straight Lines",
      "4. Pair of Straight Lines",
      "5. Circles",
      "6. System of Circles",
      "7. Parabola",
      "8. Ellipse",
      "9. Hyperbola",
      "10. Three Dimensional Coordinates",
      "11. Direction Cosines and Ratios",
      "12. Plane",
      "13. Straight Line in 3D",
      "14. Sphere"
    ]
  },
  {
    title: "V. CALCULUS",
    topics: [
      "1. Limits and Continuity",
      "2. Differentiation",
      "3. Applications of Derivatives",
      "4. Integration",
      "5. Definite Integrals",
      "6. Differential Equations"
    ]
  }
];

const physicsTopics = [
  {
    title: "I. PHYSICAL WORLD",
    topics: [
      "1. Units and Measurements",
      "2. Motion in a Straight Line",
      "3. Motion in a Plane",
      "4. Laws of Motion",
      "5. Work, Energy and Power",
      "6. Systems of Particles and Rotational Motion",
      "7. Oscillations",
      "8. Gravitation",
      "9. Mechanical Properties of Solids",
      "10. Mechanical Properties of Fluids",
      "11. Thermal Properties of Matter",
      "12. Thermodynamics",
      "13. Kinetic Theory",
      "14. Waves"
    ]
  },
  {
    title: "II. ELECTRICITY AND MAGNETISM",
    topics: [
      "1. Electric Charges and Fields",
      "2. Electrostatic Potential and Capacitance",
      "3. Current Electricity",
      "4. Moving Charges and Magnetism",
      "5. Magnetism and Matter",
      "6. Electromagnetic Induction",
      "7. Alternating Current",
      "8. Electromagnetic Waves"
    ]
  },
  {
    title: "III. OPTICS AND MODERN PHYSICS",
    topics: [
      "1. Ray Optics and Optical Instruments",
      "2. Wave Optics",
      "3. Dual Nature of Radiation and Matter",
      "4. Atoms",
      "5. Nuclei",
      "6. Semiconductor Electronics: Materials, Devices and Simple Circuits"
    ]
  }
];

const chemistryTopics = [
  {
    title: "I. PHYSICAL CHEMISTRY",
    topics: [
      "1. Atomic Structure",
      "2. Classification of Elements and Periodicity in Properties",
      "3. Chemical Bonding and Molecular Structure",
      "4. States of Matter: Gases and Liquids",
      "5. Stoichiometry",
      "6. Thermodynamics",
      "7. Chemical Equilibrium and Acids-Bases",
      "8. Solid State",
      "9. Solutions",
      "10. Electrochemistry",
      "11. Chemical Kinetics",
      "12. Surface Chemistry"
    ]
  },
  {
    title: "II. INORGANIC CHEMISTRY",
    topics: [
      "1. Hydrogen and its Compounds",
      "2. s-Block Elements (Alkali and Alkaline Earth Metals)",
      "3. p-Block Elements",
      "4. d and f Block Elements",
      "5. Coordination Compounds",
      "6. Environmental Chemistry"
    ]
  },
  {
    title: "III. ORGANIC CHEMISTRY",
    topics: [
      "1. General Principles of Organic Chemistry",
      "2. Hydrocarbons",
      "3. Haloalkanes and Haloarenes",
      "4. Alcohols, Phenols and Ethers",
      "5. Aldehydes, Ketones and Carboxylic Acids",
      "6. Organic Compounds containing Nitrogen",
      "7. Polymers",
      "8. Biomolecules",
      "9. Chemistry in Everyday Life"
    ]
  }
];

const cardStyles = {
  math: {
    bg: "bg-mathematics/20",
    header: "bg-mathematics text-white"
  },
  physics: {
    bg: "bg-physics/20",
    header: "bg-physics text-white"
  },
  chemistry: {
    bg: "bg-chemistry/20",
    header: "bg-chemistry text-white"
  }
};

type SyllabusSection = {
  title: string;
  topics: string[];
};

type SyllabusCardProps = {
  subject: string;
  topics: SyllabusSection[];
  color: keyof typeof cardStyles;
};

function SyllabusCard({ subject, topics, color }: SyllabusCardProps) {
  return (
    <div className={`syllabus-card rounded-xl shadow-md p-6 mb-8 mx-auto font-raleway ${cardStyles[color].bg}`} style={{ maxWidth: '700px', width: '100%' }}>
      <div className={`text-2xl font-bold px-4 py-2 rounded-t-lg mb-4 ${cardStyles[color].header}`}>{subject}</div>
      {topics.map((section: SyllabusSection, idx: number) => (
        <div key={section.title} className="mb-4">
          <div className="font-semibold text-lg mb-2">{section.title}</div>
          <ul className="list-disc pl-6 space-y-1">
            {section.topics.map((topic: string, i: number) => (
              <li key={i}>{topic}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function SyllabusPage() {
  return (
    <div className="min-h-screen bg-gray-600 py-10 px-2 md:px-0 font-raleway">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10 text-center tracking-tight font-raleway">TS & AP SYLLABUS</h1>
        <SyllabusCard subject="Mathematics" topics={mathTopics} color="math" />
        <SyllabusCard subject="Physics" topics={physicsTopics} color="physics" />
        <SyllabusCard subject="Chemistry" topics={chemistryTopics} color="chemistry" />
      </div>
    </div>
  );
} 