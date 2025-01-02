class Voice
  include HTTParty
  base_uri "https://api.openai.com/v1"

  def initialize
    api_key = ENV["OPENAI_API_KEY"]
    @headers = {
      "Authorization" => "Bearer #{api_key}",
      "Content-Type" => "application/json"
    }
  end

  def create_realtime_session(
    model: "gpt-4o-realtime-preview-2024-12-17",
    modalities: [ "text" ],
    instructions: "You are a friendly assistant. Reply in english. No need to ask about following up or how you can help further."
  )
    body = {
      model: model,
      modalities: modalities,
      instructions: instructions
    }

    response = self.class.post(
      "/realtime/sessions",
      headers: @headers,
      body: body.to_json
    )

    handle_response(response)
  end

  private

  def handle_response(response)
    case response.code
    when 200, 201
      response.parsed_response
    else
      raise "API Error: #{response.code} - #{response.message}"
    end
  end
end
