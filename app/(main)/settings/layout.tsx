import Header from "@/components/settings/header";
import Sidebar from "@/components/settings/sidebar";
import { SettingsProvider } from "@/contexts/settings-context";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SettingsProvider>
			<div className="flex flex-col h-screen w-screen">
				<Header />
				<div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
					<Sidebar />
					<div className="flex flex-col w-full p-4 max-w-4xl mx-auto">
						{children}
					</div>
				</div>
			</div>
		</SettingsProvider>
	);
}
