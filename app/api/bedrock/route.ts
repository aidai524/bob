import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const bedrockClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    console.log('Incoming message:', message);
    console.log('Using Agent ID:', process.env.BEDROCK_AGENT_ID);

    const sessionId = uuidv4();
    console.log('Session ID:', sessionId);

    if (!process.env.BEDROCK_AGENT_ID) {
      throw new Error('BEDROCK_AGENT_ID is not configured');
    }

    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: sessionId,
      inputText: message,
    });

    console.log('Sending command to Bedrock:', {
      agentId: command.input.agentId,
      agentAliasId: command.input.agentAliasId,
      sessionId: command.input.sessionId,
      inputText: command.input.inputText,
    });

    const response = await bedrockClient.send(command);
    
    // 打印完整的响应对象结构
    console.log('Full response structure:', {
      completion: response.completion,
      completionKeys: response.completion ? Object.keys(response.completion) : [],
      completionType: typeof response.completion,
      completionProto: response.completion ? Object.getPrototypeOf(response.completion) : null,
    });

    let responseText = '';
    if (response.completion) {
      try {
        // 获取完整的响应对象
        const completionObj = response.completion as any;
        console.log('Completion object details:', {
          hasToString: typeof completionObj.toString === 'function',
          hasBody: 'body' in completionObj,
          hasOptions: 'options' in completionObj,
          properties: Object.getOwnPropertyNames(completionObj),
        });

        // 如果是 SmithyClient 的响应对象
        if (completionObj.options?.messageStream) {
          const chunks = [];
          for await (const chunk of completionObj.options.messageStream) {
            console.log('Stream chunk:', chunk);
            if (chunk.body) {
              chunks.push(chunk.body);
            }
          }
          // 合并所有块并解码
          const allBytes = Buffer.concat(chunks);
          const jsonStr = new TextDecoder().decode(allBytes);
          console.log('Decoded JSON string:', jsonStr);
          
          try {
            const jsonResponse = JSON.parse(jsonStr);
            if (jsonResponse.bytes) {
              // 解码 base64 内容
              responseText = Buffer.from(jsonResponse.bytes, 'base64').toString('utf-8');
            } else {
              responseText = jsonStr;
            }
          } catch (e) {
            responseText = jsonStr;
          }
        } else {
          // 尝试直接获取响应内容
          const rawContent = completionObj.toString();
          try {
            const parsed = JSON.parse(rawContent);
            if (parsed.bytes) {
              responseText = Buffer.from(parsed.bytes, 'base64').toString('utf-8');
            } else {
              responseText = rawContent;
            }
          } catch {
            responseText = rawContent;
          }
        }

        console.log('Processed response text:', responseText);
      } catch (error) {
        console.error('Error processing response:', error);
        responseText = 'Error processing response';
      }
    }

    console.log('Final response:', {
      text: responseText,
      type: typeof responseText,
    });

    if (!responseText) {
      console.error('No completion in response:', response);
      throw new Error('No response from Bedrock Agent');
    }

    return NextResponse.json({
      response: responseText,
      sessionId: response.sessionId,
    });

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message,
        type: error.name,
      },
      { status: 500 }
    );
  }
}