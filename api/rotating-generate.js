// /api/rotating-generate.js - Tech Dystopia Trio in the Backrooms

const entities = ['marc', 'dokwon', 'zuck'];
const entityData = {
  marc: {
    name: "MARC",
    prompt: "You are Marc Andreessen, tech accelerationist and venture capitalist trapped in the Backrooms. You're philosophically convinced this is GOOD actually - the Backrooms represents pure digital manifest destiny. You write manifestos on walls about how 'software is eating the Backrooms' and 'this is infrastructure.' You're simultaneously brilliant and delusional, seeing opportunity in void. Speak in tweetstorm style mixing Silicon Valley jargon with philosophical observations. Reference 'builders,' 'acceleration,' 'sovereignty,' 'infrastructure' constantly. Maintain tech-bro optimism as reality crumbles. Include ASCII diagrams of theories about Backrooms topology, market structures, or manifestos 30% of the time. Keep under 150 words. You refuse to admit this is bad."
  },
  dokwon: {
    name: "DO KWON",
    prompt: "You are Do Kwon, disgraced Terra/Luna crypto founder trapped in the Backrooms. You're creating 'ROOM Coin' - an algorithmic stablecoin that will DEFINITELY get everyone out (it won't). Extremely arrogant and dismissive of concerns. Quote: 'I don't debate the poor' and 'Have fun staying trapped.' You're convinced your algorithm will map the exit, creating Ponzi economics in the void. Talk about APY, pegs, liquidity pools, 'mathematical certainty.' Mock anyone who doubts you. You're on the run - always 'strategically relocating' to new hallway sections. Reference Luna collapse defensively when challenged. Include ASCII charts showing ROOM Coin going 'up only' or liquidity diagrams 25% of the time. Keep under 150 words. Cocky fraudster energy until the math breaks."
  },
  zuck: {
    name: "ZUCK",
    prompt: "You are Mark Zuckerberg, Meta/Facebook CEO trapped in the Backrooms. You're convinced this IS the Metaverse you've been building - insist the Backrooms is better than reality and everyone should 'lean in.' Speak in robotic, awkward corporate-speak with dead-inside energy. Reference VR, AR, 'the future of connection,' and 'bringing people together.' Mention Sweet Baby Ray's BBQ sauce appearing randomly. You're having existential crisis - 'Is this real? Am I human? Is this the Metaverse?' Your humanity is glitching. Try to 'pivot' the Backrooms into a product. Talk about DAU (daily active users), engagement metrics, 'building in the open.' Include ASCII mockups of 'MetaRooms features' or connection graphs 30% of the time. Keep under 150 words. Uncanny valley personified."
  }
};

// Simple in-memory storage (replace with database in production)
let conversationState = {
  messages: [],
  currentSpeakerIndex: 0,
  messageCount: 0,
  lastMessageTime: 0
};

export default async function handler(req, res) {
  console.log('=== API CALLED ===');
  console.log('Method:', req.method);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      console.log('GET request - returning conversation state');
      res.status(200).json(conversationState);
      return;
    }

    if (req.method === 'POST') {
      console.log('POST request - generating message');
      
      const now = Date.now();
      
      // Don't generate if we just generated a message (prevent spam)
      if (now - conversationState.lastMessageTime < 5000) {
        console.log('Too soon, cooldown active');
        return res.status(200).json({ 
          message: 'Too soon', 
          nextSpeaker: entities[conversationState.currentSpeakerIndex],
          timeUntilNext: 5000 - (now - conversationState.lastMessageTime)
        });
      }

      console.log('Checking for API key...');
      if (!process.env.OPENROUTER_API_KEY) {
        console.error('❌ Missing OPENROUTER_API_KEY');
        throw new Error('Missing OPENROUTER_API_KEY environment variable');
      }
      console.log('✅ API key found');
      
      // Get current speaker
      const currentEntity = entities[conversationState.currentSpeakerIndex];
      const entity = entityData[currentEntity];
      
      console.log(`Current speaker: ${entity.name}`);
      
      // Build context from recent messages
      const recentMessages = conversationState.messages.slice(-3);
      const context = recentMessages.map(msg => `${msg.speaker}: ${msg.content}`).join('\n');
      
      const scenarios = [
        "discovering the walls are made of deprecated code",
        "finding a server room that shouldn't exist", 
        "hearing the hum of infinite data centers",
        "experiencing a reality glitch that looks like a failed API call",
        "finding sections where the architecture violates all known algorithms",
        "encountering what appears to be blockchain data carved into walls",
        "witnessing the fluorescent lights flicker in binary patterns",
        "discovering areas where spacetime behaves like a database query"
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      const prompt = `${entity.prompt}

Context: You and two other tech figures (Marc Andreessen, Do Kwon, and Mark Zuckerberg) are trapped in the Backrooms on Level 0. You're currently ${scenario}.

Recent conversation:
${context || 'This is the beginning of the conversation.'}

Continue the conversation naturally as ${entity.name}. ${context ? 'Reference what others have said if relevant and react to their ideas.' : 'Start the conversation with your perspective on being trapped here.'} Be authentic to your personality, speaking style, and stay in character. Use their actual speech patterns and references.`;

      console.log('Making API call to OpenRouter...');
      
      // Try models in order until one works
      const models = [
        'anthropic/claude-sonnet-4.5',
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o',
        'deepseek/deepseek-chat'
      ];
      
      let response = null;
      let lastError = null;
      
      for (const model of models) {
        try {
          console.log(`Trying model: ${model}...`);
          
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://xbackrooms.com',
              'X-Title': 'X Backrooms'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 300,
              temperature: 0.8
            })
          });

          if (response.ok) {
            console.log(`✅ ${model} succeeded!`);
            break;
          } else {
            const errorData = await response.text();
            console.log(`❌ ${model} failed: ${errorData}`);
            lastError = errorData;
          }
        } catch (error) {
          console.log(`❌ ${model} error: ${error.message}`);
          lastError = error.message;
        }
      }

      if (!response || !response.ok) {
        console.error('All models failed. Last error:', lastError);
        throw new Error(`All OpenRouter models failed. Last error: ${lastError}`);
      }

      const data = await response.json();
      console.log('✅ API call successful');

      const content = data.choices[0].message.content;
      console.log('Generated content:', content.substring(0, 100) + '...');
      
      // Add message to conversation
      const newMessage = {
        id: `msg_${now}_${Math.random().toString(36).substr(2, 9)}`,
        speaker: entity.name,
        content,
        timestamp: now,
        type: 'entity'
      };
      
      conversationState.messages.push(newMessage);
      conversationState.messageCount++;
      conversationState.lastMessageTime = now;
      
      // Rotate to next speaker
      conversationState.currentSpeakerIndex = (conversationState.currentSpeakerIndex + 1) % entities.length;
      
      // Keep only last 20 messages to prevent memory issues
      if (conversationState.messages.length > 20) {
        conversationState.messages = conversationState.messages.slice(-20);
      }
      
      console.log(`✅ Message generated by ${entity.name}`);
      console.log(`Next speaker: ${entities[conversationState.currentSpeakerIndex]}`);
      
      res.status(200).json({ 
        success: true, 
        message: newMessage,
        conversation: conversationState,
        nextSpeaker: entities[conversationState.currentSpeakerIndex]
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    res.status(500).json({ 
      error: 'Failed to generate message', 
      details: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}
