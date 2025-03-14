---
layout: base.njk
title: Hearing Voices
keyMessage: It's to be expected that the following exercises may be tricky at various points. Practice is required, journaling is recommended, alongside therapy and other supportive relationships.
pressPause:
  - title: Strengthen Insight
    content: >
      What helped you notice you were/are hearing a voice? What helps you accept that you hear sounds others do not?
  - title: Mindfulness
    content: >
      If you are experiencing a distressing voice, is it possible for you to try and pull your focus to your breathing for as long as you can?
  
  - title: Distress Tolerance
    content: >
      Is it possible for you to experience the distressing messages from the voice without needing to react? The <a href="https://dbt.tools/distress_tolerance/index.php">skills discussed here</a> will likely be helpful.

  - title: Imagination
    content: >
      Can you imagine a shell between you and your voices? A membrane they could bounce off of that allows you to watch them but not to have to engage them? Like you're watching waves crash in the ocean. What does this boundary feel like?

  - title: Your Own Idea
    content: >
      What feels like it would help you create a sense of safety from which to get curious about your voices?

activateCuriosity:
  - title: Where do the voices come from?
    content: >
      Can you identify familiar sounds or themes in the voices?

  - title: Why do the voices come from that place?
    content: >
      Voices are one way the body tries to protect itself. Can you wonder about why your body chooses this specific way to take care of you?

  - title: Acceptance
    content: >
      Can you cherish the hurt in the self the voices call back to?

  - title: What other questions or exercises can help you?
    content: >
      What other practices or reflections would help you better live with your voices?

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

    // Debug Supabase connection
    console.log('Checking Supabase connection...');
    const { data: testData, error: testError } = await supabase
        .from('prompts')
        .select('*')
        .limit(1);
    
    if (testError) {
        console.error('Supabase connection error:', testError);
    } else {
        console.log('Supabase connection successful, sample data:', testData);
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    // Store prompt IDs
    let promptIds = {};

    // Show journal entries if signed in
    if (session) {
        // First, get or create prompts
        async function getPrompts() {
            try {
                console.log('Starting getOrCreatePrompts');
                // Get all prompts for this page at once
                const { data: prompts, error } = await supabase
                    .from('prompts')
                    .select('*')
                    .eq('page_type', 'hearing_voices')
                    .order('section_type', { ascending: true })
                    .order('display_order', { ascending: true });
                
                if (error) {
                    console.error('Error fetching prompts:', error);
                    return;
                }
                
                console.log('All prompts:', prompts);
                
                // Map prompts to their titles
                prompts.forEach(prompt => {
                    // Only take the first prompt if there are duplicates
                    if (!promptIds[prompt.title]) {
                        promptIds[prompt.title] = prompt.id;
                    }
                });
                
                console.log('Mapped promptIds:', promptIds);
                
            } catch (error) {
                console.error('Error in getOrCreatePrompts:', error);
                console.error('Stack:', error.stack);
            }
        }

        // Wait for prompts to be ready before showing UI
        await getPrompts();
        console.log('Prompts loaded:', promptIds);

        // Show both journal entries and sidebars for signed-in users
        document.querySelectorAll('.journal-entry').forEach(entry => {
            entry.style.display = 'block';
            console.log('Showing journal entry:', entry.dataset.question);
        });
        document.querySelectorAll('.past-entries-sidebar').forEach(sidebar => {
            sidebar.style.display = 'block';
            console.log('Showing sidebar:', sidebar.dataset.question);
        });

        // Double check that elements exist
        const journalEntries = document.querySelectorAll('.journal-entry');
        const sidebars = document.querySelectorAll('.past-entries-sidebar');
        console.log(`Found ${journalEntries.length} journal entries and ${sidebars.length} sidebars`);

        // Load past entries
        async function loadEntries() {
            const { data: entries, error } = await supabase
                .from('responses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading entries:', error);
                return;
            }

            // Clear existing entries before loading
            document.querySelectorAll('.past-entries').forEach(container => {
                container.innerHTML = '';
            });

            entries.forEach(entry => {
                const matchingPrompt = Object.entries(promptIds).find(([title, id]) => id === entry.prompt_id);
                if (!matchingPrompt) {
                    console.error('Could not find prompt for prompt_id:', entry.prompt_id);
                    return;
                }
                const [promptTitle, promptId] = matchingPrompt;
                
                const section = pressPause.find(item => item.title === promptTitle) 
                    ? 'press_pause' 
                    : 'activate_curiosity';
                
                const questionSlug = promptTitle.toLowerCase().replace(/\s+/g, '-');
                
                // Try different selector combinations
                let container = null;
                const selectors = [
                    `[data-section="${section}"][data-question="${questionSlug}"] .past-entries-sidebar .past-entries`,
                    `.past-entries-sidebar[data-section="${section}"][data-question="${questionSlug}"] .past-entries`,
                    `.journal-entry[data-section="${section}"][data-question="${questionSlug}"] ~ .past-entries-sidebar .past-entries`
                ];
                
                for (const selector of selectors) {
                    container = document.querySelector(selector);
                    if (container) break;
                }
                
                console.log('Looking for container with:', {
                    promptTitle,
                    questionSlug,
                    section,
                    triedSelectors: selectors,
                    allContainers: Array.from(document.querySelectorAll('.past-entries')).map(el => ({
                        section: el.closest('[data-section]')?.dataset.section,
                        question: el.closest('[data-question]')?.dataset.question,
                        html: el.outerHTML.substring(0, 100) + '...'
                    })),
                    found: !!container
                });

                if (container) {
                    const entryEl = document.createElement('div');
                    entryEl.className = 'past-entry';
                    entryEl.dataset.entryId = entry.id;
                    entryEl.innerHTML = `
                        <div class="entry-date">${new Date(entry.created_at).toLocaleDateString()}</div>
                        <div class="entry-content" contenteditable="true">${escapeHtml(entry.content)}</div>
                        <div class="entry-actions">
                            <button class="save-edit" style="display: none;">Save</button>
                            <button class="cancel-edit" style="display: none;">Cancel</button>
                            <button class="delete-edit" style="display: none;">Delete</button>
                        </div>
                    `;

                    // Store original content for cancel functionality
                    const contentEl = entryEl.querySelector('.entry-content');
                    let originalContent = entry.content;
                    
                    // Show/hide buttons when editing
                    contentEl.addEventListener('focus', () => {
                        entryEl.querySelector('.save-edit').style.display = 'inline-block';
                        entryEl.querySelector('.cancel-edit').style.display = 'inline-block';
                        entryEl.querySelector('.delete-edit').style.display = 'inline-block';
                    });
                    
                    contentEl.addEventListener('blur', (e) => {
                        // Don't hide if clicking the action buttons
                        if (e.relatedTarget && e.relatedTarget.closest('.entry-actions')) {
                            return;
                        }
                        // Hide buttons if clicking outside
                        if (!e.relatedTarget || !e.relatedTarget.closest('.past-entry')) {
                            setTimeout(() => {
                                if (!document.activeElement.closest('.past-entry')) {
                                    entryEl.querySelector('.save-edit').style.display = 'none';
                                    entryEl.querySelector('.cancel-edit').style.display = 'none';
                                    entryEl.querySelector('.delete-edit').style.display = 'none';
                                }
                            }, 100);
                        }
                    });

                    // Save edit
                    entryEl.querySelector('.save-edit').addEventListener('click', async () => {
                        const newContent = contentEl.textContent;
                        const { error } = await supabase
                            .from('responses')
                            .update({ content: newContent })
                            .eq('id', entry.id);
                            
                        if (error) {
                            console.error('Error updating entry:', error);
                            contentEl.textContent = originalContent;
                        } else {
                            originalContent = newContent;
                            entryEl.querySelector('.save-edit').style.display = 'none';
                            entryEl.querySelector('.cancel-edit').style.display = 'none';
                            entryEl.querySelector('.delete-edit').style.display = 'none';
                        }
                    });
                    
                    // Cancel edit
                    entryEl.querySelector('.cancel-edit').addEventListener('click', () => {
                        contentEl.textContent = originalContent;
                        entryEl.querySelector('.save-edit').style.display = 'none';
                        entryEl.querySelector('.cancel-edit').style.display = 'none';
                        entryEl.querySelector('.delete-edit').style.display = 'none';
                    });

                    // Delete entry
                    entryEl.querySelector('.delete-edit').addEventListener('click', async () => {
                        if (confirm('Are you sure you want to delete this entry?')) {
                            const { error } = await supabase
                                .from('responses')
                                .delete()
                                .eq('id', entry.id);
                                
                            if (error) {
                                console.error('Error deleting entry:', error);
                            } else {
                                entryEl.remove();
                            }
                        }
                    });

                    container.appendChild(entryEl);
                } else {
                    console.error('Could not find container for entry:', {
                        promptTitle,
                        questionSlug,
                        section,
                        triedSelectors: selectors,
                        entry
                    });
                }
            });
        }

        // Save new entry
        async function saveEntry(section, question, content) {
            console.log('saveEntry called with:', { section, question, content });
            console.log('Looking up prompt ID for:', question);
            console.log('Available promptIds:', promptIds);
            const promptId = promptIds[question];  // Use original case
            if (!promptId) {
                console.error('No prompt ID found for question:', question);
                console.error('Available questions:', Object.keys(promptIds));
                return false;
            }

            console.log('Attempting to save to responses table:', { 
                content,
                prompt_id: promptId,
                user_id: session.user.id 
            });

            const { data, error } = await supabase
                .from('responses')
                .insert([
                    { 
                        content: content,
                        prompt_id: promptId,
                        user_id: session.user.id
                    }
                ])
                .select();

            if (error) {
                console.error('Error saving entry:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return false;
            }

            console.log('Entry saved successfully:', data);
            // Add new entry to UI immediately
            const questionSlug = question.toLowerCase().replace(/\s+/g, '-');
            const pastEntriesContainer = document.querySelector(
                `[data-section="${section}"][data-question="${questionSlug}"] .past-entries-sidebar .past-entries`
            );
            
            if (pastEntriesContainer) {
                const entryEl = document.createElement('div');
                entryEl.className = 'past-entry';
                entryEl.dataset.entryId = data[0].id;
                entryEl.innerHTML = `
                    <div class="entry-date">${new Date().toLocaleDateString()}</div>
                    <div class="entry-content" contenteditable="true">${escapeHtml(content)}</div>
                    <div class="entry-actions">
                        <button class="save-edit" style="display: none;">Save</button>
                        <button class="cancel-edit" style="display: none;">Cancel</button>
                        <button class="delete-edit" style="display: none;">Delete</button>
                    </div>
                `;
                
                // Add the same edit functionality as in loadEntries
                const contentEl = entryEl.querySelector('.entry-content');
                let originalContent = content;
                
                contentEl.addEventListener('focus', () => {
                    entryEl.querySelector('.save-edit').style.display = 'inline-block';
                    entryEl.querySelector('.cancel-edit').style.display = 'inline-block';
                    entryEl.querySelector('.delete-edit').style.display = 'inline-block';
                });
                
                contentEl.addEventListener('blur', (e) => {
                    // Don't hide if clicking the action buttons
                    if (e.relatedTarget && e.relatedTarget.closest('.entry-actions')) {
                        return;
                    }
                    // Hide buttons if clicking outside
                    if (!e.relatedTarget || !e.relatedTarget.closest('.past-entry')) {
                        setTimeout(() => {
                            if (!document.activeElement.closest('.past-entry')) {
                                entryEl.querySelector('.save-edit').style.display = 'none';
                                entryEl.querySelector('.cancel-edit').style.display = 'none';
                                entryEl.querySelector('.delete-edit').style.display = 'none';
                            }
                        }, 100);
                    }
                });
                
                entryEl.querySelector('.save-edit').addEventListener('click', async () => {
                    const newContent = contentEl.textContent;
                    const { error } = await supabase
                        .from('responses')
                        .update({ content: newContent })
                        .eq('id', data[0].id);
                        
                    if (error) {
                        console.error('Error updating entry:', error);
                        contentEl.textContent = originalContent;
                    } else {
                        originalContent = newContent;
                        entryEl.querySelector('.save-edit').style.display = 'none';
                        entryEl.querySelector('.cancel-edit').style.display = 'none';
                        entryEl.querySelector('.delete-edit').style.display = 'none';
                    }
                });
                
                entryEl.querySelector('.cancel-edit').addEventListener('click', () => {
                    contentEl.textContent = originalContent;
                    entryEl.querySelector('.save-edit').style.display = 'none';
                    entryEl.querySelector('.cancel-edit').style.display = 'none';
                    entryEl.querySelector('.delete-edit').style.display = 'none';
                });
                
                // Insert at the top of the list
                pastEntriesContainer.insertBefore(entryEl, pastEntriesContainer.firstChild);
            }

            return true;
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
