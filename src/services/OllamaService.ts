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
        console.error("Error connecting to Ollama: ", err);
        throw new Error("It wasn't possible to connect to Ollama. Verify if it's running properly.");
    }
}

/**
 * Envia um prompt (e um prompt de sistema opcional) para o modelo Ollama e retorna a resposta completa.
 * @param prompt O prompt do usuário.
 * @param sys_prompt Opcional. A instrução de sistema que guia o comportamento do modelo.
 * @returns Uma Promise que resolve para a string de conteúdo da resposta do assistente.
 */
export async function chatResponse(prompt: string, sys_prompt? : string ) {

    const messages = [];

    if(sys_prompt){
        messages.push({role: 'system', content: sys_prompt});
    }

    messages.push({role: 'user', content: prompt});

    try {
       const modelResponse = await ollama.chat({
        model: OLLAMA_MODEL,
        messages : messages,
        stream : false
       });
       
       return modelResponse.message.content;

    } catch (err) {
        console.error("Error connecting to Ollama: ",err);
        throw new Error("It wasn't possible to connect to Ollama. Verify if it's running properly");
    }

}