import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";

import PlaceholderCommand from "./placeholdercommand";
import "./theme/placeholder.css";

export default class PlaceholderEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    console.log("PlaceholderEditing#init() got called");

    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(
      "placeholder",
      new PlaceholderCommand(this.editor)
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("placeholder", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["name"],
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: ["placeholder"],
      },
      model: (viewElement, { writer: modelWriter }) => {
        const name = viewElement.getChild(0).data.slice(1, -1);

        return modelWriter.createElement("placeholder", { name });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem, { writer: viewWriter }) => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        return toWidget(widgetElement, viewWriter);
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem, { writer: viewWriter }) =>
        createPlaceholderView(modelItem, viewWriter),
    });

    function createPlaceholderView(modelItem, viewWriter) {
      const name = modelItem.getAttribute("name");

      const placeholderView = viewWriter.createContainerElement("span", {
        class: "placeholder",
      });

      const innerText = viewWriter.createText("{" + name + "}");
      viewWriter.insert(
        viewWriter.createPositionAt(placeholderView, 0),
        innerText
      );

      return placeholderView;
    }
  }
}
