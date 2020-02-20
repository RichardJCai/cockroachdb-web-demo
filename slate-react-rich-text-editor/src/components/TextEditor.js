import React, { Component, Fragment } from 'react';

import Icon from 'react-icons-kit';
import { animateScroll } from "react-scroll";

export default class TextEditor extends Component {
	state = {
		value: "",
		textBoxValue: "",
		clientKey: NaN,
	};

	componentDidMount = (() => {
		fetch('http://192.168.10.62:8082/new_client')
		.then(res => res.text())
		.then(txt => this.setState({clientKey: txt}))
	})

	// handleValueChange = (evt) => {
	// 	this.setState({ value: evt.target.value})
	// }

	handleTextBoxChange = (evt) => {
		this.setState({ textBoxValue: evt.target.value})
	}

	onKeyDown = (e, change) => {
		if (e.key === "Enter") {

			fetch('http://192.168.10.62:8082/client/' + this.state.clientKey +'/send_input', {'method': 'POST', 'body': this.state.textBoxValue})
			.then(res => res.text())
			.then(txt => {
				this.setState({value: this.state.value + this.state.textBoxValue + "\n----------\n" + txt + "\n", textBoxValue: ""}, this.scrollToBottom);
			})
		}
	};


	hasLinks = () => {
		const { value } = this.state;
		return value.inlines.some((inline) => inline.type === 'link');
	};

	wrapLink = (change, href) => {
		change.wrapInline({
			type: 'link',
			data: { href },
		});

		change.collapseToEnd();
	};

	unwrapLink = (change) => change.unwrapInline('link');

	onLinkClick = (e) => {
		/* disabling browser default behavior like page refresh, etc */
		e.preventDefault();

		const { value } = this.state;
		const hasLinks = this.hasLinks();
		const change = value.change();

		if (hasLinks) {
			change.call(this.unwrapLink);
		} else if (value.isExpanded) {
			const href = window.prompt('Enter the URL of the link:');
			href.length > 0 ? change.call(this.wrapLink, href) : null;
		} else {
			const href = window.prompt('Enter the URL of the link:');
			const text = window.prompt('Enter the text for the link:');

			href.length > 0
				? change
						.insertText(text)
						.extend(0 - text.length)
						.call(this.wrapLink, href)
				: null;
		}

		this.onChange(change);
	};

	renderLinkIcon = (type, icon) => (
		<button
			onPointerDown={(e) => this.onLinkClick(e, type)}
			className="tooltip-icon-button"
		>
			<Icon icon={icon} />
		</button>
	);

	onMarkClick = (e, type) => {
		/* disabling browser default behavior like page refresh, etc */
		e.preventDefault();

		/* grabbing the this.state.value */
		const { value } = this.state;

		/*
			applying the formatting on the selected text
			which the desired formatting
		*/
		const change = value.change().toggleMark(type);

		/* calling the  onChange method we declared */
		this.onChange(change);
	};
	
	scrollToBottom() {
		animateScroll.scrollToBottom({
		  containerId: "containerEl",
		  duration: 0,
		});
	}

	render() {
		return (
			<Fragment>
				<div className="container" id="containerEl"
					onChange={this.scrollToBottom()}>
					<div className="inner" id="containerEl"
						onChange={this.scrollToBottom()}>
							<p>Welcome to CockroachDB!</p>
							{this.state.value}
					</div>
				</div>

				<input className="input"
					type="text"
					value={this.state.textBoxValue}
					onChange={this.handleTextBoxChange}
					onKeyDown={this.onKeyDown}
					placeholder="Enter Command"
					/>
			</Fragment>
		);
	}
}
