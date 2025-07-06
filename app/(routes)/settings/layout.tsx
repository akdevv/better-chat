import SettingsHeader from "@/components/settings/settings-header";
import SettingsSidebar from "@/components/settings/settings-sidebar";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col h-screen w-screen">
			<SettingsHeader />
			<div className="flex flex-1 overflow-hidden">
				<SettingsSidebar isSidebarOpen={true}/>
			{children}
			</div> 
		</div>
	);
}
