import ollama from 'ollama';

const OLLAMA_MODEL = 'deepseek-coder:1.3b';

/**
 * 
 * @param prompt O prompt do usuário
 * @returns Um AsyncIterable contendo os pedaços da resposta
 */
export async function streamChatResponse(prompt: string) {

    try {
        const streamResponse = await ollama.chat({
            model : OLLAMA_MODEL,
            messages : [{role: "user", content: "prompt"}],
            stream: true,
        });
        return streamResponse;
    } catch (err) {
        console.error("Error connecting to Ollama:", err);
        throw new Error("It wasn't possible to connect to Ollama. Verify if it's running.");
    }
}