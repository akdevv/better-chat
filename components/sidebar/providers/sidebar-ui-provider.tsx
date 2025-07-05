"use client";

import { SidebarUIContextType } from "@/lib/types/sidebar";
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
} from "react";

const SidebarUIContext = createContext<SidebarUIContextType | undefined>(
	undefined
);

export const useSidebarUI = () => {
	const context = useContext(SidebarUIContext);
	if (!context) {
		throw new Error("useSidebarUI must be used within SidebarUIProvider");
	}
	return context;
};

const STORAGE_KEY = "sidebar-collapsed";

export const SidebarUIProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Refs to avoid re-renders
	const isInitializedRef = useRef(false);

	// Load saved state from localStorage - only once
	useEffect(() => {
		if (!isInitializedRef.current) {
			isInitializedRef.current = true;
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				setCollapsed(JSON.parse(saved));
			}
		}
	}, []);

	// Check if we're on mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768); // md breakpoint
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Close mobile menu when switching to desktop
	useEffect(() => {
		if (!isMobile && isMobileMenuOpen) {
			setIsMobileMenuOpen(false);
		}
	}, [isMobile, isMobileMenuOpen]);

	const toggleSidebar = () => {
		if (isMobile) {
			setIsMobileMenuOpen(!isMobileMenuOpen);
		} else {
			const newCollapsed = !collapsed;
			setCollapsed(newCollapsed);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollapsed));
		}
	};

	const setSidebarCollapsed = (newCollapsed: boolean) => {
		if (!isMobile) {
			setCollapsed(newCollapsed);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollapsed));
		}
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	const openMobileMenu = () => {
		if (isMobile) {
			setIsMobileMenuOpen(true);
		}
	};

	const value: SidebarUIContextType = useMemo(
		() => ({
			collapsed,
			isMobile,
			isMobileMenuOpen,
			toggleSidebar,
			setSidebarCollapsed,
			closeMobileMenu,
			openMobileMenu,
		}),
		[
			collapsed,
			isMobile,
			isMobileMenuOpen,
			toggleSidebar,
			setSidebarCollapsed,
			closeMobileMenu,
			openMobileMenu,
		]
	);

	return (
		<SidebarUIContext.Provider value={value}>
			{children}
		</SidebarUIContext.Provider>
	);
};
