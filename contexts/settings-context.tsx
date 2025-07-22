"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";
export type AccentColor = "blue" | "green" | "purple" | "orange" | "red";
export type Font = "Inter" | "Syne" | "Roboto" | "Outfit" | "Poppins";

interface SettingsContextValue {
	theme: Theme;
	accentColor: AccentColor;
	font: Font;
	setTheme: (theme: Theme) => void;
	setAccentColor: (color: AccentColor) => void;
	setFont: (font: Font) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
	undefined,
);

export function useSettingsContext() {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within SettingsProvider");
	}
	return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("system");
	const [accentColor, setAccentColor] = useState<AccentColor>("blue");
	const [font, setFont] = useState<Font>("Syne");

	// Load settings from localStorage on mount
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as Theme;
		const savedAccentColor = localStorage.getItem("accentColor") as AccentColor;
		const savedFont = localStorage.getItem("font") as Font;

		if (savedTheme) setTheme(savedTheme);
		if (savedAccentColor) setAccentColor(savedAccentColor);
		if (savedFont) setFont(savedFont);
	}, []);

	// Apply theme changes to document
	useEffect(() => {
		const root = document.documentElement;

		// Remove existing theme classes
		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}

		localStorage.setItem("theme", theme);
	}, [theme]);

	// Apply accent color changes
	useEffect(() => {
		localStorage.setItem("accentColor", accentColor);
		// You can implement accent color CSS custom properties here if needed
	}, [accentColor]);

	// Apply font changes
	useEffect(() => {
		localStorage.setItem("font", font);
		// You can implement font changes here if needed
	}, [font]);

	const value: SettingsContextValue = {
		theme,
		accentColor,
		font,
		setTheme,
		setAccentColor,
		setFont,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
}
