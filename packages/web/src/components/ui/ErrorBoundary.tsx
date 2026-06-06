import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-ink-sec mb-2">出了点问题</p>
              <p className="text-sm text-ink-dim mb-4">
                {this.state.error?.message ?? "未知错误"}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 text-sm text-accent border border-accent/30 rounded-full hover:bg-accent/5"
              >
                重试
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
