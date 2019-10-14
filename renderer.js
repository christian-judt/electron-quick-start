// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { mainObjectForRenderer } = window.require("electron").remote.require("./main");

const addResult = (name, expected, actual) =>
{
    const actualIsEcpected = actual === expected;

    const title = document.createElement("span");
    title.append(`${name}: `);

    const text = document.createElement("span");
    text.style.color = actualIsEcpected ? "green" : "red";
    text.append(actual === expected
        ? `Expected and got string '${actual}'`
        : `Expected string '${expected}' but got '${actual}'`);

    const result = document.createElement("div");
    result.style.marginTop = "10px";
    result.append(title);
    result.append(text);

    document.getElementsByTagName("body")[0].append(result);
}

(async () =>
{
    addResult("Synchronous RPC from renderer to main", "synchronousMain", await mainObjectForRenderer.synchronousMethod());
    addResult("Asynchronous RPC from renderer to main using callback", "callbackMain", await new Promise(resolve => mainObjectForRenderer.callbackMethod(resolve)));
    addResult("Asynchronous RPC from renderer to main using promise", "promiseMain", await mainObjectForRenderer.promiseMethod());

    const rendererId = `renderer_${require('electron').remote.getCurrentWindow().id}`;
    mainObjectForRenderer.setRendererObjectForMain(rendererId,
    {
        synchronousMethod: () =>
        {
            return "synchronousRenderer";
        },
        callbackMethod: (callback) =>
        {
            setTimeout(() => callback("callbackRenderer"), 1000);
        },
        promiseMethod: () =>
        {
            return new Promise(resolve =>
            {
            setTimeout(() => resolve("promiseRenderer"), 1000);
            });
        }
    });

    addResult("Synchronous RPC from main to renderer", "synchronousRenderer", await mainObjectForRenderer.invokeSynchronousRendererObjectMethodFromMain(rendererId));
    addResult("Asynchronous RPC from main to renderer using callback", "callbackRenderer", await mainObjectForRenderer.invokeCallbackRendererObjectMethodFromMain(rendererId));
    addResult("Asynchronous RPC from main to renderer using promise", "promiseRenderer", await mainObjectForRenderer.invokePromiseRendererObjectMethodFromMain(rendererId));
})();