import { FileData, FileCategory } from "@/lib/types/file";
import { getFileCategory } from "@/lib/constants/supported-files";

const MAX_FILE_SIZE_FOR_CONTENT = 32 * 1024 * 1024; // 32MB

export const FILE_ANALYSIS_PROMPTS = {
	image: `Analyze this image and provide:

• **Visual Content**: Describe what you see - objects, people, scenes, text
• **Technical Details**: Quality, style, composition, colors, lighting  
• **Text Extraction**: Transcribe any visible text accurately
• **Context**: Infer the purpose or context of the image
• **Insights**: Answer questions or suggest improvements

Be thorough but concise.`,

	document: `Analyze this document and provide:

• **Summary**: Main content and purpose overview
• **Key Points**: Most important information and findings
• **Structure**: Organization (sections, chapters, format)
• **Action Items**: Deadlines, requirements, next steps
• **Questions**: Any clarifications needed

Focus on extracting maximum value.`,

	code: `Review this code and provide:

• **Overview**: What the code does and its purpose
• **Technology**: Language, frameworks, libraries used
• **Quality**: Structure, readability, best practices
• **Issues**: Bugs, security, performance concerns
• **Improvements**: Specific optimization suggestions
• **Documentation**: Comment on existing docs

Be constructive and educational.`,

	data: `Analyze this data and provide:

• **Overview**: Dataset structure, columns, content type
• **Quality**: Completeness, consistency, issues found
• **Insights**: Patterns, trends, outliers, key findings
• **Statistics**: Relevant counts, averages, ranges
• **Visualizations**: Recommended charts or graphs
• **Opportunities**: Further analysis suggestions

Focus on meaningful insights.`,
};

export const generateFileContextPrompt = (files: FileData[]): string => {
	if (files.length === 0) return "";

	const categorizedFiles = files.map((file) => {
		return {
			...file,
			category: getFileCategory(file.name, file.type),
		};
	});

	// Group files by category
	const filesByCategory = categorizedFiles.reduce(
		(acc, file) => {
			if (!acc[file.category]) acc[file.category] = [];
			acc[file.category].push(file);
			return acc;
		},
		{} as Record<FileCategory, typeof categorizedFiles>,
	);

	let systemPrompt = `The user has attached ${files.length} file(s) to this conversation. Please analyze and help them with these files.\n\n`;

	// Add category-specific prompts
	for (const [category, categoryFiles] of Object.entries(filesByCategory)) {
		if (categoryFiles.length > 0) {
			systemPrompt += `**${category.toUpperCase()} FILES (${
				categoryFiles.length
			}):**\n`;
			systemPrompt += FILE_ANALYSIS_PROMPTS[category as FileCategory] + "\n\n";

			// List the files in this category
			systemPrompt += `Files in this category:\n`;
			categoryFiles.forEach((file) => {
				systemPrompt += `- ${file.name} (${file.type}, ${(
					file.size / 1024
				).toFixed(1)}KB)\n`;
			});
			systemPrompt += "\n";
		}
	}

	systemPrompt += `**GENERAL GUIDELINES:**
- Be thorough but concise in your analysis
- If the user asks specific questions, prioritize those
- Provide actionable insights and suggestions
- Ask clarifying questions when helpful
- Be transparent about any limitations in file processing
- Focus on being maximally helpful to the user

Please analyze the attached files and provide your insights based on the user's message.`;

	return systemPrompt;
};

export const fetchFileContent = async (
	url: string,
	mimeType: string,
	size: number,
): Promise<string | null> => {
	try {
		if (size > MAX_FILE_SIZE_FOR_CONTENT) {
			console.warn(`File too large to read content: ${size} bytes`);
			return null;
		}

		const isImage = mimeType.startsWith("image/");
		if (isImage) {
			return `[IMAGE: ${url}]`;
		} else {
			const res = await fetch(url);
			if (!res.ok) {
				console.warn(`Failed to fetch file content: ${res.statusText}`);
				return null;
			}

			const text = await res.text();
			return text;
		}
	} catch (error) {
		console.error("Error fetching file content:", error);
		return null;
	}
};
