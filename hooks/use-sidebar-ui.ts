"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "sidebar-collapsed";

export function useSidebarUI() {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// ref to aviod re-renders
	const isInitializedRef = useRef(false);

	// load saved state
	useEffect(() => {
		if (!isInitializedRef.current) {
			isInitializedRef.current = true;
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				setIsCollapsed(JSON.parse(saved));
			}
		}
	}, []);

	// check if mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768); // md breakpoint
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// close mobile menu when switching to desktop
	useEffect(() => {
		if (!isMobile && isMobileMenuOpen) {
			setIsMobileMenuOpen(false);
		}
	}, [isMobile, isMobileMenuOpen]);

	const toggleSidebar = useCallback(() => {
		if (isMobile) {
			setIsMobileMenuOpen((prev) => !prev);
		} else {
			setIsCollapsed((prev) => {
				const newIsCollapsed = !prev;
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify(newIsCollapsed),
				);
				return newIsCollapsed;
			});
		}
	}, [isMobile, isMobileMenuOpen]);

	const closeMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	return {
		isCollapsed,
		isMobile,
		isMobileMenuOpen,
		toggleSidebar,
		closeMobileMenu,
	};
}
