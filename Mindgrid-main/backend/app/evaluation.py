def evaluate_debate(messages):
    user_word_count = 0
    ai_word_count = 0

    for message in messages:
        if message.sender_type == 'user':
            user_word_count += len(message.content.split())
        elif message.sender_type == 'ai':
            ai_word_count += len(message.content.split())

    if user_word_count > ai_word_count:
        return 'user'
    elif ai_word_count > user_word_count:
        return 'ai'
    else:
        return 'draw'
