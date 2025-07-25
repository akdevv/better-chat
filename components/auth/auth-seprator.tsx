export default function AuthSeparator({
	text = "Or continue with",
}: {
	text?: string;
}) {
	return (
		<div className="relative">
			<div className="absolute inset-0 flex items-center">
				<span className="w-full border-t border-border"></span>
			</div>
			<div className="relative flex justify-center text-xs">
				<span className="bg-background px-2 text-muted-foreground">{text}</span>
			</div>
		</div>
	);
}
