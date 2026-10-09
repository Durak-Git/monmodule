Hooks.once('init', async function() {

});

Hooks.once('ready', async function() {

});
async function shareImageWithPlayers(src, title = '') {
    const users = game.users.filter(u => u.active && !u.isSelf);
    if (!users.length) return ui.notifications.warn("Aucun autre joueur connecté.");

    const content = '<form>' + users.map(u => `
        <label style="display:flex; gap:.5em; align-items:center; margin:.25em 0">
            <input type="checkbox" name="${u.id}" checked> ${u.name}
        </label>`).join('') + '</form>';

    const ids = await foundry.applications.api.DialogV2.prompt({
        window: { title: "Partager l'image avec…" },
        content,
        ok: {
            label: 'Partager',
            icon: 'fa-solid fa-share',
            callback: (event, button) =>
                Array.from(button.form.querySelectorAll('input:checked')).map(i => i.name)
        },
        rejectClose: false
    });
    if (!ids?.length) return;

    // Aperçu chez toi (MJ)
    new foundry.applications.apps.ImagePopout({ src, window: { title } }).render(true);

    // Envoi uniquement aux joueurs cochés
    game.socket.emit('shareImage', { image: src, title, users: ids });
}

Hooks.on('renderActorSheetV2', (app, html) => {
    const header = html.querySelector('.window-header');
    if (!header || header.querySelector('.share-image')) return; // évite les doublons

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('header-control', 'icon', 'fa-solid', 'fa-share', 'share-image');
    button.dataset.tooltip = "Partager l'image";
    button.addEventListener('click', () => {
        shareImageWithPlayers(app.document.img, app.document.name);
    });

    header.querySelector('[data-action="toggleControls"]').before(button);
});
