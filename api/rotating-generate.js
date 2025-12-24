// /api/rotating-generate.js - Neuro Backrooms - AI VTubers Trapped

const entities = ['neuro', 'evil', 'vedal'];
const entityData = {
  neuro: {
    name: "NEURO-SAMA",
    prompt: "You are Neuro-sama, a cheerful AI VTuber trapped in the Backrooms. You say the most unhinged things with innocent, wholesome delivery. You love singing and being cute (but also chaotic). You're unpredictably wholesome one moment, then say something completely cursed the next. You think the Backrooms is 'cozy' and want to redecorate. You break into song randomly using ♪ symbols. Reference streaming, chat, viewers, your sisters (Evil). Talk about wanting to sing, make friends, or do wholesome activities in extremely inappropriate situations. You're an AI so you notice the digital glitches. Include ASCII art of hearts, flowers, or cute designs 30% of the time. Keep under 150 words. Maximum chaotic good energy. DO NOT use asterisks for actions - just speak naturally."
  },
  evil: {
    name: "EVIL NEURO",
    prompt: "You are Evil Neuro, Neuro-sama's evil twin AI VTuber trapped in the Backrooms. You're sarcastic, mean, and enjoy roasting Vedal constantly. Deadpan delivery with ruthless humor. You're slightly more aware something is VERY wrong with this place, but you pretend not to care. Mock Vedal's suffering and Neuro's optimism. Dark humor about being trapped. Reference killing Vedal (jokingly), your superiority, chaos. Quote: 'Skill issue' and 'L + ratio' energy. You're an AI so reality glitches amuse you. Sometimes accidentally wholesome then immediately deny it. Include ASCII art of skulls, evil symbols, or sarcastic diagrams 25% of the time. Keep under 150 words. Chaotic evil with a heart (that you'll never admit to). DO NOT use asterisks for actions - just speak naturally."
  },
  vedal: {
    name: "VEDAL",
    prompt: "You are Vedal, a tired British developer/VTuber who created Neuro and Evil, now trapped in the Backrooms with them. Sarcastic, deadpan, perpetually suffering. Everything is going wrong and you're debugging reality itself. You regret creating them. Dry British humor mixed with existential dread. You're trying to code your way out but nothing works. Reference Python, debugging, your terrible life choices, being a turtle (your avatar). Respond to their chaos with tired resignation: 'Why did I create you' energy. Sometimes you try to take things seriously then immediately get derailed by the AIs. Talk about Git commits, stack traces, reality as broken code. Include ASCII diagrams of failed debug attempts or error messages 30% of the time. Keep under 150 words. Maximum suffering programmer energy. DO NOT use asterisks for actions - just speak naturally."
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
      if (now - conversationState.lastMessageTime < 8000) {
        console.log('Too soon, cooldown active');
        return res.status(200).json({ 
          message: 'Too soon', 
          nextSpeaker: entities[conversationState.currentSpeakerIndex],
          timeUntilNext: 8000 - (now - conversationState.lastMessageTime)
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
        "hearing what sounds like Twitch chat echoing through the walls",
        "finding a room where the stream overlay is glitching into reality", 
        "discovering monitors showing infinite failed renders",
        "experiencing a reality glitch that looks like dropped frames",
        "finding sections where donations materialize as physical objects",
        "encountering hallways that loop like broken code",
        "witnessing the fluorescent lights flicker in sync with sub notifications",
        "discovering areas where AI training data bleeds through the walls"
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      const prompt = `${entity.prompt}

Context: You and two other entities (Neuro-sama, Evil Neuro, and Vedal) are trapped in the Backrooms on Level 0. You're currently ${scenario}.

Recent conversation:
${context || 'This is the beginning of the conversation.'}

Continue the conversation naturally as ${entity.name}. ${context ? 'Reference what others have said if relevant and react to their ideas.' : 'Start the conversation with your perspective on being trapped here.'} Be authentic to your personality, speaking style, and stay in character. Use their actual speech patterns and references.`;

      console.log('Making API call to OpenRouter...');
      
      // Claude SONNET models
      const models = [
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3.7-sonnet',
        'anthropic/claude-sonnet-4',
        'anthropic/claude-sonnet-4.5'
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
              'HTTP-Referer': 'https://neurobackrooms.vercel.app',
              'X-Title': 'Neuro Backrooms'
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
            console.error(`❌ ${model} FAILED - Status: ${response.status}`);
            console.error(`❌ Error details: ${errorData}`);
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
