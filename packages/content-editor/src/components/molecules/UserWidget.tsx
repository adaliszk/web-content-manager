import { component$, useVisibleTask$ } from "@builder.io/qwik";

export const UserWidget = component$(() => {
    // useVisibleTask$(() => {
    //     if (window.PasswordCredential || window.FederatedCredential) {
    //         // Call navigator.credentials.get() to retrieve stored
    //         // PasswordCredentials or FederatedCredentials.
    //     }
    // });

    return <h1>HALLO</h1>;
});
