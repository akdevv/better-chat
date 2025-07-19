"use client";

import { memo } from "react";

interface Orb {
	id: string;
	size: string;
	position: string;
	gradient: string;
	blur: string;
	animation?: string;
	hideOnMobile?: boolean;
}

const generateBackgroundOrbs = (): Orb[] => [
	// Large orbs
	{
		id: "orb-1",
		size: "w-36 sm:w-48 h-36 sm:h-48",
		position: "-top-12 sm:-top-16 -left-12 sm:-left-16",
		gradient: "from-violet-500/35 via-purple-600/25 to-indigo-500/20",
		blur: "blur-xl sm:blur-2xl",
	},
	{
		id: "orb-2",
		size: "w-42 sm:w-56 h-42 sm:h-56",
		position: "-bottom-16 sm:-bottom-20 -right-8 sm:-right-12",
		gradient: "from-rose-500/30 via-pink-500/25 to-orange-400/20",
		blur: "blur-xl sm:blur-2xl",
	},
	{
		id: "orb-3",
		size: "w-32 sm:w-40 h-32 sm:h-40",
		position: "top-1/3 right-1/3",
		gradient: "from-emerald-500/28 via-teal-400/20 to-cyan-400/25",
		blur: "blur-lg sm:blur-xl",
	},
	// Medium orbs
	{
		id: "orb-4",
		size: "w-24 sm:w-32 h-24 sm:h-32",
		position: "top-0 right-0",
		gradient: "from-amber-400/25 via-yellow-500/18 to-orange-500/15",
		blur: "blur-lg sm:blur-xl",
	},
	{
		id: "orb-5",
		size: "w-28 sm:w-36 h-28 sm:h-36",
		position: "bottom-0 left-1/4",
		gradient: "from-blue-400/30 via-indigo-400/20 to-purple-400/18",
		blur: "blur-lg sm:blur-xl",
	},
	{
		id: "orb-6",
		size: "w-20 sm:w-28 h-20 sm:h-28",
		position: "top-1/2 left-0",
		gradient: "from-green-400/25 via-emerald-400/18 to-teal-400/15",
		blur: "blur-md sm:blur-lg",
	},
	{
		id: "orb-7",
		size: "w-18 sm:w-24 h-18 sm:h-24",
		position: "top-1/4 right-1/4",
		gradient: "from-fuchsia-400/22 via-pink-400/18 to-rose-400/15",
		blur: "blur-md sm:blur-lg",
	},
	// Small orbs - hidden on mobile
	{
		id: "orb-8",
		size: "w-16 sm:w-20 h-16 sm:h-20",
		position: "top-3/4 right-1/6",
		gradient: "from-slate-400/20 via-gray-400/15 to-zinc-400/12",
		blur: "blur-md sm:blur-lg",
		hideOnMobile: true,
	},
	{
		id: "orb-9",
		size: "w-14 sm:w-18 h-14 sm:h-18",
		position: "bottom-1/4 right-2/3",
		gradient: "from-red-400/18 via-orange-400/15 to-yellow-400/12",
		blur: "blur-sm sm:blur-md",
		hideOnMobile: true,
	},
	{
		id: "orb-10",
		size: "w-12 sm:w-16 h-12 sm:h-16",
		position: "top-1/6 left-1/3",
		gradient: "from-sky-400/20 via-blue-400/15 to-indigo-400/12",
		blur: "blur-sm sm:blur-md",
		hideOnMobile: true,
	},
];

const generateFloatingParticles = () => [
	{
		id: "p1",
		position: "top-3 sm:top-4 left-1/4",
		size: "w-2 sm:w-3 h-2 sm:h-3",
		color: "bg-violet-400/50",
		delay: "",
	},
	{
		id: "p2",
		position: "bottom-4 sm:bottom-6 right-1/4",
		size: "w-2 sm:w-2.5 h-2 sm:h-2.5",
		color: "bg-rose-400/60",
		delay: "delay-300",
	},
	{
		id: "p3",
		position: "top-1/2 left-1/6",
		size: "w-1.5 sm:w-2 h-1.5 sm:h-2",
		color: "bg-emerald-400/70",
		delay: "delay-700",
	},
	{
		id: "p4",
		position: "top-2/3 right-1/5",
		size: "w-1 sm:w-1.5 h-1 sm:h-1.5",
		color: "bg-amber-400/60",
		delay: "delay-500",
	},
	{
		id: "p5",
		position: "bottom-1/3 left-1/5",
		size: "w-1.5 sm:w-2 h-1.5 sm:h-2",
		color: "bg-cyan-400/55",
		delay: "delay-1000",
	},
	{
		id: "p6",
		position: "top-1/5 right-2/5",
		size: "w-1 sm:w-1.5 h-1 sm:h-1.5",
		color: "bg-fuchsia-400/65",
		delay: "delay-200",
	},
];

// Memoized background component
export const AnimatedBackground = memo(() => {
	const orbs = generateBackgroundOrbs();
	const particles = generateFloatingParticles();

	return (
		<div className="absolute inset-0 z-0 transition-all duration-700 overflow-hidden rounded-xl">
			{/* Base gradient */}
			<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/8 via-purple-500/6 to-emerald-500/8 opacity-80" />

			{/* Orbs */}
			{orbs.map((orb) => (
				<div
					key={orb.id}
					className={`
            absolute ${orb.position} ${orb.size} 
            bg-gradient-to-br ${orb.gradient} 
            rounded-full filter ${orb.blur} 
            transition-all duration-1000
            ${orb.hideOnMobile ? "hidden xs:block" : ""}
          `}
				/>
			))}

			{/* Floating particles */}
			{particles.map((particle) => (
				<div
					key={particle.id}
					className={`
            absolute ${particle.position} ${particle.size} 
            ${particle.color} rounded-full filter blur-sm 
            animate-pulse ${particle.delay}
          `}
				/>
			))}
		</div>
	);
});
