const fs = require("fs");
require("dotenv").config();

const { PDFParse } = require("pdf-parse");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { MistralAIEmbeddings } = require("@langchain/mistralai");
const { Pinecone } = require("@pinecone-database/pinecone");

async function main() {
    
    const bufferData = fs.readFileSync("./How_to_Become_a_Developer_6_Pages.pdf");

    const parser = new PDFParse({
        data: bufferData,
    });

    
    const pdf = await parser.getText();

    
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 0,
    });
    

    const allSplits = await splitter.splitText(pdf.text);
    console.log(allSplits)

    console.log(`Total Chunks: ${allSplits.length}`);

    
    const embeddings = new MistralAIEmbeddings({
        apiKey: process.env.MISTRAL_API_KEY,
        model: "mistral-embed",
    });

    const vectors = await embeddings.embedDocuments(allSplits);
    

    console.log(`Generated ${vectors.length} embeddings`);

    
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

    
    const records = vectors.map((vector, i) => ({
        id: `chunk-${i}`,
        values: vector,
        metadata: {
            data: allSplits[i],
            chunk: i,
            source: "How_to_Become_a_Developer_6_Pages.pdf",
        },
    }));

    
    await index.upsert(records);

    console.log("✅ All vectors stored successfully in Pinecone!");

    await parser.destroy();
}

main().catch(console.error);