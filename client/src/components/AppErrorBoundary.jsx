/**
 * @fileoverview Last-resort UI boundary for unrecoverable render failures.
 */

import { Component } from "react";
import { clearStoredAuth } from "../utils/authStorage.js";

export class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("Application startup failed.", error, errorInfo);
    }
  }

  resetApplication = () => {
    clearStoredAuth();
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="startup-error-page">
          <section className="startup-error-card">
            <span className="logo-mark">SG</span>
            <h1>Unable to load the application</h1>
            <p>Your saved session may be outdated. Reset it and reload the application.</p>
            <button className="primary-button" type="button" onClick={this.resetApplication}>
              Reset session and reload
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
