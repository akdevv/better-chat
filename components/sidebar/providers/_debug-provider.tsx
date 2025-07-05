"use client";

import React, { useRef, useState } from "react";
import { useSidebar } from "@/components/sidebar/providers/sidebar-provider";
import { useSidebarUI } from "@/components/sidebar/providers/sidebar-ui-provider";

let sidebarProviderRenderCount = 0;
let sidebarUIProviderRenderCount = 0;

const DebugTracker = React.memo(() => {
	const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
	const [recentLogs, setRecentLogs] = useState<string[]>([]);

	// Track SidebarProvider renders
	const sidebarData = useSidebar();
	const prevSidebarRef = useRef(sidebarData);

	// Detect changes in SidebarProvider
	const sidebarChanges = [];
	if (prevSidebarRef.current.chats !== sidebarData.chats) {
		sidebarChanges.push(
			`chats: ${prevSidebarRef.current.chats.length} → ${sidebarData.chats.length}`
		);
	}
	if (prevSidebarRef.current.isLoading !== sidebarData.isLoading) {
		sidebarChanges.push(
			`isLoading: ${prevSidebarRef.current.isLoading} → ${sidebarData.isLoading}`
		);
	}
	if (prevSidebarRef.current.isLoadingMore !== sidebarData.isLoadingMore) {
		sidebarChanges.push(
			`isLoadingMore: ${prevSidebarRef.current.isLoadingMore} → ${sidebarData.isLoadingMore}`
		);
	}
	if (prevSidebarRef.current.hasMore !== sidebarData.hasMore) {
		sidebarChanges.push(
			`hasMore: ${prevSidebarRef.current.hasMore} → ${sidebarData.hasMore}`
		);
	}

	// Function reference changes
	if (prevSidebarRef.current.fetchChats !== sidebarData.fetchChats) {
		sidebarChanges.push("fetchChats ref changed");
	}
	if (
		prevSidebarRef.current.handleChatDelete !== sidebarData.handleChatDelete
	) {
		sidebarChanges.push("handleChatDelete ref changed");
	}
	if (
		prevSidebarRef.current.handleChatUpdate !== sidebarData.handleChatUpdate
	) {
		sidebarChanges.push("handleChatUpdate ref changed");
	}
	if (
		prevSidebarRef.current.handleChatRefresh !==
		sidebarData.handleChatRefresh
	) {
		sidebarChanges.push("handleChatRefresh ref changed");
	}
	if (prevSidebarRef.current.loadMoreChats !== sidebarData.loadMoreChats) {
		sidebarChanges.push("loadMoreChats ref changed");
	}

	if (sidebarChanges.length > 0) {
		sidebarProviderRenderCount++;
		const logMessage = `🔴 SidebarProvider #${sidebarProviderRenderCount}: ${sidebarChanges.join(
			", "
		)}`;
		console.log(logMessage);

		// Add to recent logs (keep last 5)
		setRecentLogs((prev) => [...prev.slice(-4), logMessage]);
	}
	prevSidebarRef.current = sidebarData;

	// Track SidebarUIProvider renders
	const sidebarUIData = useSidebarUI();
	const prevSidebarUIRef = useRef(sidebarUIData);

	// Detect changes in SidebarUIProvider
	const sidebarUIChanges = [];
	if (prevSidebarUIRef.current.collapsed !== sidebarUIData.collapsed) {
		sidebarUIChanges.push(
			`collapsed: ${prevSidebarUIRef.current.collapsed} → ${sidebarUIData.collapsed}`
		);
	}
	if (prevSidebarUIRef.current.isMobile !== sidebarUIData.isMobile) {
		sidebarUIChanges.push(
			`isMobile: ${prevSidebarUIRef.current.isMobile} → ${sidebarUIData.isMobile}`
		);
	}
	if (
		prevSidebarUIRef.current.isMobileMenuOpen !==
		sidebarUIData.isMobileMenuOpen
	) {
		sidebarUIChanges.push(
			`isMobileMenuOpen: ${prevSidebarUIRef.current.isMobileMenuOpen} → ${sidebarUIData.isMobileMenuOpen}`
		);
	}

	// Function reference changes
	if (
		prevSidebarUIRef.current.toggleSidebar !== sidebarUIData.toggleSidebar
	) {
		sidebarUIChanges.push("toggleSidebar ref changed");
	}
	if (
		prevSidebarUIRef.current.setSidebarCollapsed !==
		sidebarUIData.setSidebarCollapsed
	) {
		sidebarUIChanges.push("setSidebarCollapsed ref changed");
	}
	if (
		prevSidebarUIRef.current.closeMobileMenu !==
		sidebarUIData.closeMobileMenu
	) {
		sidebarUIChanges.push("closeMobileMenu ref changed");
	}
	if (
		prevSidebarUIRef.current.openMobileMenu !== sidebarUIData.openMobileMenu
	) {
		sidebarUIChanges.push("openMobileMenu ref changed");
	}

	if (sidebarUIChanges.length > 0) {
		sidebarUIProviderRenderCount++;
		const logMessage = `🔵 SidebarUIProvider #${sidebarUIProviderRenderCount}: ${sidebarUIChanges.join(
			", "
		)}`;
		console.log(logMessage);

		// Add to recent logs (keep last 5)
		setRecentLogs((prev) => [...prev.slice(-4), logMessage]);
	}
	prevSidebarUIRef.current = sidebarUIData;

	const totalRenders =
		sidebarProviderRenderCount + sidebarUIProviderRenderCount;

	// Collapsed state - circular debug icon
	if (!isExpanded) {
		return (
			<button
				onClick={() => setIsExpanded(true)}
				className="fixed top-4 right-4 z-[9999] w-12 h-12 bg-card border border-border rounded-full shadow-lg backdrop-blur-sm hover:bg-accent/50 transition-all duration-200 flex items-center justify-center group"
				title={`Debug Tracker - ${totalRenders} renders`}
			>
				{/* Debug Icon */}
				<svg
					className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-colors"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
					/>
				</svg>

				{/* Render count badge */}
				{totalRenders > 0 && (
					<div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
						{totalRenders > 99 ? "99+" : totalRenders}
					</div>
				)}

				{/* Pulse animation for active renders */}
				{(sidebarData.isLoading || sidebarData.isLoadingMore) && (
					<div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse"></div>
				)}
			</button>
		);
	}

	// Expanded state - full debug interface
	return (
		<div className="fixed top-4 right-4 z-[9999] w-80 bg-card border border-border rounded-lg shadow-xl backdrop-blur-sm">
			<div className="p-4">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
						<h3 className="font-semibold text-card-foreground text-sm">
							Debug Tracker
						</h3>
					</div>
					<button
						onClick={() => setIsExpanded(false)}
						className="text-muted-foreground hover:text-card-foreground transition-colors text-xs px-2 py-1 rounded hover:bg-accent"
					>
						Collapse
					</button>
				</div>

				{/* Render Counts */}
				<div className="grid grid-cols-2 gap-3 mb-4">
					<div className="bg-accent/30 rounded-lg p-3 border border-accent">
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
							Sidebar Provider
						</div>
						<div className="text-lg font-bold text-destructive">
							{sidebarProviderRenderCount}
						</div>
					</div>
					<div className="bg-accent/30 rounded-lg p-3 border border-accent">
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
							Sidebar UI Provider
						</div>
						<div className="text-lg font-bold text-primary">
							{sidebarUIProviderRenderCount}
						</div>
					</div>
				</div>

				{/* Total Counter */}
				<div className="bg-muted/50 rounded-lg p-3 mb-4 border border-muted">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">
							Total Renders
						</span>
						<span className="text-xl font-bold text-card-foreground">
							{totalRenders}
						</span>
					</div>
					<div className="text-xs text-muted-foreground mt-1">
						{totalRenders > 10
							? "⚠️ High render count"
							: "✅ Normal render count"}
					</div>
				</div>

				{/* Expanded Details */}
				{isExpanded && (
					<div className="space-y-3">
						{/* Current State */}
						<div className="bg-accent/20 rounded-lg p-3 border border-accent/50">
							<div className="text-xs font-semibold text-card-foreground mb-2">
								Current State
							</div>
							<div className="grid grid-cols-2 gap-2 text-[10px]">
								<div>
									<span className="text-muted-foreground">
										Chats:
									</span>
									<span className="ml-1 text-card-foreground font-mono">
										{sidebarData.chats.length}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">
										Loading:
									</span>
									<span
										className={`ml-1 font-mono ${
											sidebarData.isLoading
												? "text-destructive"
												: "text-muted-foreground"
										}`}
									>
										{sidebarData.isLoading ? "Yes" : "No"}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">
										Load More:
									</span>
									<span
										className={`ml-1 font-mono ${
											sidebarData.isLoadingMore
												? "text-destructive"
												: "text-muted-foreground"
										}`}
									>
										{sidebarData.isLoadingMore
											? "Yes"
											: "No"}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">
										Has More:
									</span>
									<span
										className={`ml-1 font-mono ${
											sidebarData.hasMore
												? "text-primary"
												: "text-muted-foreground"
										}`}
									>
										{sidebarData.hasMore ? "Yes" : "No"}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">
										Collapsed:
									</span>
									<span
										className={`ml-1 font-mono ${
											sidebarUIData.collapsed
												? "text-primary"
												: "text-muted-foreground"
										}`}
									>
										{sidebarUIData.collapsed ? "Yes" : "No"}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">
										Mobile:
									</span>
									<span
										className={`ml-1 font-mono ${
											sidebarUIData.isMobile
												? "text-primary"
												: "text-muted-foreground"
										}`}
									>
										{sidebarUIData.isMobile ? "Yes" : "No"}
									</span>
								</div>
							</div>
						</div>

						{/* Recent Activity */}
						{recentLogs.length > 0 && (
							<div className="bg-muted/30 rounded-lg p-3 border border-muted">
								<div className="text-xs font-semibold text-card-foreground mb-2">
									Recent Activity
								</div>
								<div className="space-y-1 max-h-32 overflow-y-auto">
									{recentLogs
										.slice(-5)
										.reverse()
										.map((log, index) => (
											<div
												key={index}
												className="text-[10px] font-mono text-muted-foreground bg-background/50 rounded px-2 py-1 border border-border/50"
											>
												{log.replace(/🔴|🔵/, "")}
											</div>
										))}
								</div>
							</div>
						)}

						{/* Console Hint */}
						<div className="text-center">
							<div className="text-[10px] text-muted-foreground">
								💡 Open console for detailed logs
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});

DebugTracker.displayName = "DebugTracker";

export const SidebarDebugProvider = React.memo(() => {
	return <DebugTracker />;
});

SidebarDebugProvider.displayName = "SidebarDebugProvider";
