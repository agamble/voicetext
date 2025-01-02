# VoiceText

VoiceText is a demo of a voice-input, text-output AI assistant.

## Motivation

I'm not a super fast typist, so communicating my question to ChatGPT feels slow. I really like the OpenAI [Advanced Voice Mode](https://www.youtube.com/watch?v=Mckd-FhJlp0), but having the model speak its response back to me feels slow too, particularly when the response includes code.

Using my Mac's native transcription for inputs gets some of way there, but it's not seamless:

- I have to click the microphone icon in the ChatGPT interface.
- I have to wait for the transcription to finish.
- I have to submit the transcription to ChatGPT.
- I have to wait for the model to respond.

Removing even these small amounts of friction makes the experience feel much more natural.

## Demo

[![VoiceText Demo](https://cdn.loom.com/sessions/thumbnails/84f417447e814894ac6cc589e4949b31-13e52c8bbf2264aa.gif)](https://www.loom.com/share/84f417447e814894ac6cc589e4949b31)

## How to run

Add your OpenAI API key to the `OPENAI_API_KEY` environment variable. The easiest way to do this is to set it in your `.env` file in the root of the repository.

Then you can run the server with:

```ruby
bundle install
./bin/dev
```

You can then navigate to `http://localhost:3000` in your browser.
