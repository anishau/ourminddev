---
layout: base.njk
title: Paranoia
keyMessage: It's to be expected that the following excercises may be tricky at various points. Practice is required, journaling is recommended, alongside therapy and other supportive relationships.

pressPause:


  - title: Strengthen Insight
    content: >
      When you are wondering if others are trying to hurt you, don't like you, etc. what helps you consider that this may be paranoia?

  - title: Stay With The Feeling
    content: >
      When experiencing a fear that others may want to hurt you, don't like you, etc., is it possible to teach yourself to stay with that feeling without acting on it?

      Skills like <a href="https://dbt.tools/distress_tolerance/index.php">distress tolerance</a> may be especially useful.
  
  - title: Broaden Your Perspective
    content: >
      Once you can find some presence of mind within that space, is it possible to consider alternatives? That while people may be trying to hurt you, they also may be trying to help you? Or they may be neutral towards you.

      Try and hold room for this breadth of perspective as much as you can.
  
  - title: Be With Ambiguity
    content: >
      Alternately, can you backtrack for a second, and recognize what situation caused you to feel paranoid?

      Often, paranoia is caused by stimuli that feel ambiguous in some way. Is it possible for you to sit with the ambiguity itself, without jumping to conclusions about it? What makes that hard?

  - title: Your Own Idea
    content: >
      What feels like it would help you create a sense of safety from which to get curious about your paranoia?

activateCuriosity:
  - title: Where does the paranoia locate itself?
    content: >
      Why do you think that people are looking at you, talking about you, wanting to hurt you, etc? Are there aspects of yourself that make you self-conscious or embarrassed?

  - title: Where are you vulnerable to paranoia?
    content: >
      Why do these parts of yourself or your presentation make you self conscious, embarrassed, or hateful towards yourself?

  - title: Acceptance
    content: >
      Can you accept these aspects of yourself with pride and love for your uniqueness?

  - title: What other questions or exercises can help you?
    content: >
      What other practices or reflections would help you better live with your paranoia?
---

<div class="key-message">{{ keyMessage }}</div>

<div class="press-pause">
    <h2>Press Pause</h2>
    {% for item in pressPause %}
    <div class="press-pause-section">
        <div class="section-content">
            <h3>{{ item.title }}</h3>
            {{ item.content | safe }}
            <div class="journal-entry" data-section="press_pause" data-question="{{ item.title | slug }}" style="display: none">
                <textarea placeholder="Write your reflections here..."></textarea>
                <button class="save-entry">Save</button>
            </div>
        </div>
        <div class="past-entries-sidebar" data-section="press_pause" data-question="{{ item.title | slug }}" style="display: none">
            <h4>Previous Entries</h4>
            <div class="past-entries"></div>
        </div>
    </div>
    {% endfor %}
</div>

<div class="activate-curiosity">
    <h2>Activate Curiosity</h2>
    {% for item in activateCuriosity %}
    <div class="activate-curiosity-section">
        <div class="section-content">
            <h3>{{ item.title }}</h3>
            {{ item.content | safe }}
            <div class="journal-entry" data-section="activate_curiosity" data-question="{{ item.title | slug }}" style="display: none">
                <textarea placeholder="Write your reflections here..."></textarea>
                <button class="save-entry">Save</button>
            </div>
        </div>
        <div class="past-entries-sidebar" data-section="activate_curiosity" data-question="{{ item.title | slug }}" style="display: none">
            <h4>Previous Entries</h4>
            <div class="past-entries"></div>
        </div>
    </div>
    {% endfor %}
</div>

<script type="module">
    // Get data from front matter
    const pressPause = {{ pressPause | dump | safe }};
    const activateCuriosity = {{ activateCuriosity | dump | safe }};

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    // Store prompt IDs
    let promptIds = {};

    // Show journal entries if signed in
    if (session) {
        // First, get or create prompts
        async function getOrCreatePrompts() {
            try {
                console.log('Starting getOrCreatePrompts');
                for (const section of ['press_pause', 'activate_curiosity']) {
                    const items = section === 'press_pause' ? pressPause : activateCuriosity;
                    
                    for (const item of items) {
                        // Check if prompt exists
                        const { data, error } = await supabase
                            .from('prompts')
                            .select('id')
                            .eq('page_type', 'paranoia')
                            .eq('section_type', section)
                            .eq('content', item.content)
                            .single();
                        
                        if (error) {
                            console.error('Error finding prompt:', error);
                            continue;
                        } else if (data) {
                            promptIds[item.title] = data.id;
                            console.log(`Found prompt ID for "${item.title}":`, data.id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error in getOrCreatePrompts:', error);
            }
        }

        // Wait for prompts to be ready before showing UI
        await getOrCreatePrompts();

        document.querySelectorAll('.journal-entry').forEach(entry => {
            entry.style.display = 'block';
        })
        document.querySelectorAll('.past-entries-sidebar').forEach(sidebar => {
            sidebar.style.display = 'block';
        })

        // Load past entries
        async function loadEntries() {
            const { data: entries, error } = await supabase
                .from('responses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error loading entries:', error)
                return
            }

            // Group entries by question
            entries.forEach(entry => {
                const container = document.querySelector(`[data-question="${entry.prompt_id}"] .past-entries-sidebar .past-entries`)
                if (container) {
                    const entryEl = document.createElement('div')
                    entryEl.className = 'past-entry'
                    entryEl.innerHTML = `
                        <div class="entry-date">${new Date(entry.created_at).toLocaleDateString()}</div>
                        <div class="entry-content">${entry.content}</div>
                    `
                    container.appendChild(entryEl)
                }
            })
        }

        // Save new entry
        async function saveEntry(section, question, content) {
            console.log('saveEntry called with:', { section, question, content });
            console.log('Looking up prompt ID for:', question);
            console.log('Available promptIds:', promptIds);
            const promptId = promptIds[question];
            if (!promptId) {
                console.error('No prompt ID found for question:', question);
                console.error('Available questions:', Object.keys(promptIds));
                return false;
            }

            const { error } = await supabase
                .from('responses')
                .insert([
                    { 
                        content: content,
                        prompt_id: promptId,
                        user_id: session.user.id
                    }
                ])

            if (error) {
                console.error('Error saving entry:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return false
            }

            return true
        }

        // Helper function to escape HTML
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Add event listeners to save buttons
        document.querySelectorAll('.save-entry').forEach(button => {
            button.addEventListener('click', async () => {
                const journalEntry = button.closest('.journal-entry')
                const textarea = journalEntry.querySelector('textarea')
                const section = journalEntry.dataset.section
                // Find the original title from the slug
                const questionSlug = journalEntry.dataset.question
                const items = section === 'press_pause' ? pressPause : activateCuriosity
                const originalQuestion = items.find(item => item.title.toLowerCase().replace(/\s+/g, '-') === questionSlug)?.title
                
                if (!originalQuestion) {
                    console.error('Could not find original question for slug:', questionSlug)
                    return
                }

                const content = textarea.value.trim()

                if (content) {
                    const success = await saveEntry(section, originalQuestion, content)
                    if (success) {
                        // Add new entry to UI immediately
                        const pastEntriesContainer = document.querySelector(`[data-section="${section}"][data-question="${questionSlug}"] .past-entries-sidebar .past-entries`)
                        if (pastEntriesContainer) {
                            const entryEl = document.createElement('div')
                            entryEl.className = 'past-entry'
                            entryEl.innerHTML = `
                                <div class="entry-date">${new Date().toLocaleDateString()}</div>
                                <div class="entry-content">${escapeHtml(content)}</div>
                            `
                            // Insert at the top of the list
                            pastEntriesContainer.insertBefore(entryEl, pastEntriesContainer.firstChild)
                            textarea.value = ''
                        }
                    }
                }
            })
        })

        // Load entries on page load
        loadEntries()
    }
</script>

