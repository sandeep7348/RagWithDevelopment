const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const { MistralAIEmbeddings } = require("@langchain/mistralai");
require("dotenv").config();

async function search() {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    const embeddings = new MistralAIEmbeddings({
        apiKey: process.env.MISTRAL_API_KEY,
        model: "mistral-embed",
    });

    const vectorStore = await PineconeStore.fromExistingIndex(
        embeddings,
        {
            pineconeIndex: index,
        }
    );

    const results = await vectorStore.similaritySearch(
        "learning programming fundamentals",
        1// top 3 similar chunks
    );

    console.log(results);
}

search().catch(console.error);