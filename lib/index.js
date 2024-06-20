import { ICommandPalette, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { ILayoutRestorer } from '@jupyterlab/application';
;
class APODWidget extends Widget {
    /**
    * Construct a new APOD widget.
    */
    constructor() {
        super();
        this.addClass('my-apodWidget');
        // Add an image element to the panel
        this.img = document.createElement('img');
        this.node.appendChild(this.img);
        // Add a summary element to the panel
        this.summary = document.createElement('p');
        this.node.appendChild(this.summary);
    }
    /**
    * Handle update requests for the widget.
    */
    async updateAPODImage() {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${this.randomDate()}`);
        if (!response.ok) {
            const data = await response.json();
            if (data.error) {
                this.summary.innerText = data.error.message;
            }
            else {
                this.summary.innerText = response.statusText;
            }
            return;
        }
        const data = await response.json();
        if (data.media_type === 'image') {
            // Populate the image
            this.img.src = data.url;
            this.img.title = data.title;
            this.summary.innerText = data.title;
            if (data.copyright) {
                this.summary.innerText += ` (Copyright ${data.copyright})`;
            }
        }
        else {
            this.summary.innerText = 'Random APOD fetched was not an image.';
        }
    }
    /**
    * Get a random date string in YYYY-MM-DD format.
    */
    randomDate() {
        const start = new Date(2010, 1, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().slice(0, 10);
    }
}
/**
* Activate the APOD widget extension.
*/
function activate(app, palette, restorer) {
    console.log('JupyterLab extension jupyterlab_apod is activated!');
    // Declare a widget variable
    let widget;
    // Add an application command
    const command = 'apod:open';
    app.commands.addCommand(command, {
        label: 'Random Astronomy Picture',
        execute: () => {
            if (!widget || widget.isDisposed) {
                const content = new APODWidget();
                widget = new MainAreaWidget({ content });
                widget.id = 'apod-jupyterlab';
                widget.title.label = 'Astronomy Picture';
                widget.title.closable = true;
            }
            if (!tracker.has(widget)) {
                // Track the state of the widget for later restoration
                tracker.add(widget);
            }
            if (!widget.isAttached) {
                // Attach the widget to the main work area if it's not there
                app.shell.add(widget, 'main');
            }
            widget.content.updateAPODImage();
            // Activate the widget
            app.shell.activateById(widget.id);
        }
    });
    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
    // Track and restore the widget state
    let tracker = new WidgetTracker({
        namespace: 'apod'
    });
    if (restorer) {
        restorer.restore(tracker, {
            command,
            name: () => 'apod'
        });
    }
}
/**
 * Initialization data for the jupyterlab_apod extension.
 */
const plugin = {
    id: 'jupyterlab_apod',
    description: 'A JupyterLab extension for showing apod.',
    autoStart: true,
    requires: [ICommandPalette],
    optional: [ILayoutRestorer],
    activate: activate
};
export default plugin;
//# sourceMappingURL=index.js.map